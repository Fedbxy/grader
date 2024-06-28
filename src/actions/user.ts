"use server";

import { editProfileSchema } from "@/lib/zod";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

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
                error: "Your request is invalid.",
            };
        }

        const { user } = await validateRequest();
        if (!user) {
            return {
                error: "You must be signed in to edit your profile.",
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
            error: "An unexpected error occurred. Please try again later.",
        };
    }
    redirect("/settings");
}