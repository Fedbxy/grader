"use server";

import { changePasswordSchema, editAccountSchema } from "@/lib/zod/user";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { messages } from "@/config/messages";
import { compare, hash } from "bcrypt";
import { lucia } from "@/lib/auth";
import { uploadFile, deleteFile } from "@/lib/minio";

export async function editAccount(data: FormData) {
    try {
        const avatar = data.get("avatar") as File || undefined;
        const displayName = data.get("displayName") as string;
        const bio = data.get("bio") as string;

        const parsed = editAccountSchema.safeParse({
            avatar,
            displayName,
            bio,
        });
        if (!parsed.success) {
            return {
                error: messages.form.invalid,
            };
        }

        const { user } = await validateRequest();
        if (!user) {
            return {
                error: messages.auth.unauthenticated,
            };
        }

        const updateData: any = {};

        if (avatar) {
            if (user.avatar) deleteFile(user.avatar);
            uploadFile(`user/${user.id}/avatar.${avatar.type.split("/")[1]}`, avatar);
            updateData.avatar = `user/${user.id}/avatar.${avatar.type.split("/")[1]}`;
        }

        if (displayName !== user.displayName) {
            updateData.displayName = displayName;
        }

        if (bio !== user.bio) {
            updateData.bio = bio || null;
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
                where: { id: user.id },
                data: updateData,
            });
        } else if (!avatar) {
            return {
                error: messages.form.noChanges,
            };
        }
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: messages.form.unexpected,
        };
    }
    redirect("/settings");
}

export async function changePassword(data: FormData) {
    try {
        const password = data.get("password") as string;
        const newPassword = data.get("newPassword") as string;
        const confirmNewPassword = data.get("confirmNewPassword") as
            string;

        const parsed = changePasswordSchema.safeParse({
            password,
            newPassword,
            confirmNewPassword,
        });
        if (!parsed.success) {
            return {
                error: messages.form.invalid,
            };
        }

        const { user } = await validateRequest();
        if (!user) {
            return {
                error: messages.auth.unauthenticated,
            };
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { password: true },
        });
        if (!dbUser) {
            return {
                error: messages.form.unexpected,
            };
        }

        const passwordValid = await compare(password, dbUser.password
        );
        if (!passwordValid) {
            return {
                error: messages.form.invalidPassword,
            };
        }

        const newPasswordHash = await hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: newPasswordHash,
            },
        });

        await lucia.invalidateUserSessions(user.id);
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: messages.form.unexpected,
        };
    }
    redirect("/signin");
}