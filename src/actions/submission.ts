"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { messages } from "@/config/messages";
import { canShareCode } from "@/utils/submission";

// Shares a submission's code with everyone who can see the submission, or makes
// it private again. Allowed for the submitter and admins.
export async function setCodePublic(id: number, codePublic: boolean) {
    try {
        const { user } = await validateRequest();
        if (!user) {
            return {
                error: messages.auth.unauthenticated,
            };
        }

        const submission = await prisma.submission.findUnique({
            where: { id },
            select: { userId: true },
        });
        if (!submission) {
            return {
                error: messages.database.noSubmission,
            };
        }
        if (!canShareCode(user, submission)) {
            return {
                error: messages.auth.unauthorized,
            };
        }

        await prisma.submission.update({
            where: { id },
            data: { codePublic },
        });
    } catch (error) {
        console.error(error);
        return {
            error: messages.form.unexpected,
        };
    }
}
