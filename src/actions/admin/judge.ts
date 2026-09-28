"use server";

import prisma from "@/lib/prisma";
import { messages } from "@/config/messages";
import { redirect } from "next/navigation";
import { allowAccess } from "@/utils/access";

// Rejudges queue behind live submissions. Without this they would jump ahead:
// the queue is ordered by id, and rejudged rows are by definition older.
const requeue = {
    judgeStatus: "pending",
    status: "Pending",
    priority: 1,
    attempts: 0,
    score: 0,
    result: [],
    errorCode: null,
    error: null,
} as const;

export async function rejudge(id: number) {
    try {
        const accessResult = await allowAccess("admin", "action");
        if (accessResult) {
            return accessResult;
        }

        const submission = await prisma.submission.findUnique({
            where: { id },
        });
        if (!submission) {
            return {
                error: messages.database.noSubmission,
            };
        }

        await prisma.submission.update({
            where: { id },
            data: requeue,
        });
    } catch (error) {
        console.error(error);
        return {
            error: messages.form.unexpected,
        };
    }
}

export async function rejudgeAllSubmission(problemId: number) {
    try {
        const accessResult = await allowAccess("admin", "action");
        if (accessResult) {
            return accessResult;
        }

        // One statement for the whole problem, rather than a request per
        // submission.
        await prisma.submission.updateMany({
            where: { problemId },
            data: requeue,
        });
    } catch (error) {
        console.error(error);
        return {
            error: messages.form.unexpected,
        };
    }

    redirect(`/problem/${problemId}/submission`);
}
