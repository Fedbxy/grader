"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { lucia, validateRequest } from "@/lib/auth";
import { signUpSchema, signInSchema } from "@/lib/zod/user";
import { redirect } from "next/navigation";
import { compare, hash } from "bcrypt";
import { messages } from "@/config/messages";
import { verifyTurnstile } from "@/lib/turnstile";

export async function signup(data: FormData, nextUrl?: string) {
    try {
        const token = data.get("turnstileToken") as string;

        const captchaResult = await verifyTurnstile(token);
        if (!captchaResult.success) {
            return {
                error: captchaResult.error,
            };
        }

        const username = data.get("username") as string;
        const password = data.get("password") as string;
        const confirmPassword = data.get("confirmPassword") as string;

        const parsed = signUpSchema.safeParse({
            username,
            password,
            confirmPassword,
        });
        if (!parsed.success) {
            return {
                error: messages.form.invalid,
            };
        }

        const { session } = await validateRequest();
        if (session) {
            return {
                error: messages.auth.signedIn,
            };
        }

        const existingUsers = await prisma.user.findMany({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive",
                },
            },
        });
        if (existingUsers.length > 0) {
            return {
                error: messages.auth.usernameTaken,
            };
        }

        const passwordHash = await hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                displayName: username,
                password: passwordHash,
            },
        });

        const newSession = await lucia.createSession(newUser.id, {});
        const sessionCookie = lucia.createSessionCookie(newSession.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: messages.form.unexpected,
        };
    }
    redirect(nextUrl || "/");
}

export async function signin(data: FormData, nextUrl?: string) {
    try {
        const token = data.get("turnstileToken") as string;

        const captchaResult = await verifyTurnstile(token);
        if (!captchaResult.success) {
            return {
                error: captchaResult.error,
            };
        }

        const username = data.get("username") as string;
        const password = data.get("password") as string;

        const parsed = signInSchema.safeParse({
            username,
            password,
        });
        if (!parsed.success) {
            return {
                error: messages.form.invalid,
            };
        }

        const { session } = await validateRequest();
        if (session) {
            return {
                error: messages.auth.signedIn,
            };
        }

        const user = await prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            return {
                error: messages.auth.wrongCredentials,
            };
        }

        const passwordValid = await compare(password, user.password);
        if (!passwordValid) {
            return {
                error: messages.auth.wrongCredentials,
            };
        }

        if (user.isBanned) {
            return {
                error: messages.auth.banned,
            };
        }

        await lucia.invalidateUserSessions(user.id);
        const newSession = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(newSession.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: messages.form.unexpected,
        };
    }
    redirect(nextUrl || "/");
}

export async function signout() {
    try {
        const { session } = await validateRequest();
        if (!session) {
            return {
                error: messages.auth.noSession,
            };
        }

        await lucia.invalidateSession(session.id);

        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: messages.form.unexpected,
        };
    }
    redirect("/signin");
}