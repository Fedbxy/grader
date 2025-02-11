"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { allowAccess } from "@/utils/access";
import { createAnnouncementSchema, editAnnouncementSchema } from "@/lib/zod/announcement";
import { Visibility } from "@/types/announcement";
import { redirect } from "next/navigation";
import { messages } from "@/config/messages";

export async function createAnnouncement(data: FormData) {
    try {
        const accessResult = await allowAccess("admin", "action");
        if (accessResult) {
            return accessResult;
        }

        const title = data.get("title") as string;
        const content = data.get("content") as string;
        const visibility = data.get("visibility") as Visibility;

        const parsed = createAnnouncementSchema.safeParse({
            title,
            content,
            visibility,
        });
        if (!parsed.success) {
            return {
                error: messages.form.invalid,
            };
        }

        const { user } = await validateRequest();
        if (!user) {
            return {
                error: messages.auth.noSession,
            };
        }

        await prisma.announcement.create({
            data: {
                title,
                content,
                visibility,
                authorId: user.id,
            },
        });
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: messages.form.unexpected,
        };
    }
    redirect("/dashboard/announcement");
}

export async function editAnnouncement(id: number, data: FormData) {
    try {
        const accessResult = await allowAccess("admin", "action");
        if (accessResult) {
            return accessResult;
        }

        const title = data.get("title") as string;
        const content = data.get("content") as string;
        const visibility = data.get("visibility") as Visibility;

        const parsed = editAnnouncementSchema.safeParse({
            title,
            content,
            visibility,
        });
        if (!parsed.success) {
            return {
                error: messages.form.invalid,
            };
        }

        const announcement = await prisma.announcement.findUnique({
            where: { id },
        });
        if (!announcement) {
            return {
                error: messages.database.noAnnouncement,
            };
        }

        const updateData: any = {};

        if (title !== announcement.title) {
            updateData.title = title;
        }

        if (content !== announcement.content) {
            updateData.content = content;
        }

        if (visibility !== announcement.visibility) {
            updateData.visibility = visibility;
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.announcement.update({
                where: { id },
                data: updateData,
            });
        } else {
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
    redirect("/dashboard/announcement");
}

export async function changeVisibility(id: number, visibility: Visibility) {
    try {
        const accessResult = await allowAccess("admin", "action");
        if (accessResult) {
            return accessResult;
        }

        const announcement = await prisma.announcement.findUnique({
            where: { id },
        });
        if (!announcement) {
            return {
                error: messages.database.noAnnouncement,
            };
        }

        await prisma.announcement.update({
            where: { id },
            data: { visibility },
        });
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: messages.form.unexpected,
        };
    }
}