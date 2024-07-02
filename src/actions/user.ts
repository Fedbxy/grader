"use server";

import { editProfileSchema } from "@/lib/zod";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { messages } from "@/config/messages";

export async function editProfile(data: FormData) {
    try {
        const displayName = data.get("displayName") as string;
        const bio = data.get("bio") as string;

        const parsed = editProfileSchema.safeParse({
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

        await prisma.user.update({
            where: { id: user.id },
            data: {
                displayName,
                bio,
            },
        });
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: messages.form.unexpected, 
        };
    }
    redirect("/settings");
}