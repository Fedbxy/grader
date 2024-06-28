"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { lucia, validateRequest } from "@/lib/auth";
import { signUpSchema, signInSchema } from "@/lib/zod";
import { redirect } from "next/navigation";
import { compare, hash } from "bcrypt";

export async function signup(data: FormData) {
    try {
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
                error: "Your request is invalid.",
            };
        }

        const { session } = await validateRequest();
        if (session) {
            return {
                error: "You are already signed in.",
            };
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            return {
                error: "Username is already taken.",
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
            error: "An unexpected error occurred. Please try again later.",
        };
    }
    redirect("/settings");
}

export async function signin(data: FormData) {
    try {
        const username = data.get("username") as string;
        const password = data.get("password") as string;

        const parsed = signInSchema.safeParse({
            username,
            password,
        });
        if (!parsed.success) {
            return {
                error: "Your request is invalid.",
            };
        }

        const { session } = await validateRequest();
        if (session) {
            return {
                error: "You are already signed in.",
            };
        }

        const user = await prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            return {
                error: "Invalid username or password.",
            };
        }

        const passwordValid = await compare(password, user.password);
        if (!passwordValid) {
            return {
                error: "Invalid username or password.",
            };
        }

        const newSession = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(newSession.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: "An unexpected error occurred. Please try again later.",
        };
    }
    redirect("/");
}

export async function signout() {
    try {
        const { session } = await validateRequest();
        if (!session) {
            return {
                error: "Session not found.",
            };
        }

        await lucia.invalidateSession(session.id);

        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: "An unexpected error occurred. Please try again later.",
        };
    }
    redirect("/signin");
}