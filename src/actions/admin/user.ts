"use server";

import prisma from "@/lib/prisma";
import { allowAccess, lucia } from "@/lib/auth";
import { editUserSchema } from "@/lib/zod/user";
import { Role } from "@/lib/types";
import { hash } from "bcrypt";
import { redirect } from "next/navigation";
import { messages } from "@/config/messages";
import { uploadFile, deleteFile } from "@/lib/minio";

export async function editUser(id: number, data: FormData) {
    await allowAccess("admin");

    try {
        const username = data.get("username") as string;
        const displayName = data.get("displayName") as string;
        const avatar = data.get("avatar") as File || undefined;
        const bio = data.get("bio") as string;
        const role = data.get("role") as Role;
        const password = data.get("password") as string;
        const confirmPassword = data.get("confirmPassword") as string;

        const parsed = editUserSchema.safeParse({
            username,
            displayName,
            avatar,
            bio,
            role,
            password,
            confirmPassword,
        });
        if (!parsed.success) {
            return {
                error: messages.form.invalid,
            };
        }

        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            return {
                error: messages.database.noUser,
            };
        }

        const updateData: any = {};

        if (username !== user.username) {
            const existingUser = await prisma.user.findUnique({
                where: { username },
            });
            if (existingUser) {
                return {
                    error: messages.auth.usernameTaken,
                };
            }
            updateData.username = username;
        }

        if (displayName !== user.displayName) {
            updateData.displayName = displayName;
        }

        if (avatar) {
            if (user.avatar) deleteFile(user.avatar);
            uploadFile(`user/${user.id}/avatar.${avatar.type.split("/")[1]}`, avatar);
            updateData.avatar = `user/${user.id}/avatar.${avatar.type.split("/")[1]}`;
        }

        if (bio !== user.bio) {
            updateData.bio = bio || null;
        }

        if (role !== user.role) {
            updateData.role = role;
        }

        if (password) {
            const passwordHash = await hash(password, 10);
            updateData.password = passwordHash;

            lucia.invalidateUserSessions(id);
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
                where: { id },
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
    redirect("/dashboard/user");
}

export async function deleteUser(id: number) {
    await allowAccess("admin");

    try {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            return {
                error: messages.database.noUser,
            };
        }

        deleteFile(`user/${user.id}`);

        await prisma.user.delete({
            where: { id },
        });
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: messages.form.unexpected,
        };
    }
    redirect("/dashboard/user");
}