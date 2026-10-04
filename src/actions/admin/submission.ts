"use server";

import prisma from "@/lib/prisma";
import { messages } from "@/config/messages";
import { allowAccess } from "@/utils/access";

// Hides a submission from everyone but its submitter and admins, or shows it again.
export async function setSubmissionHidden(id: number, hidden: boolean) {
    try {
        const accessResult = await allowAccess("admin", "action");
        if (accessResult) {
            return accessResult;
        }

        const submission = await prisma.submission.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!submission) {
            return {
                error: messages.database.noSubmission,
            };
        }

        await prisma.submission.update({
            where: { id },
            data: { hidden },
        });
    } catch (error) {
        console.error(error);
        return {
            error: messages.form.unexpected,
        };
    }
}
