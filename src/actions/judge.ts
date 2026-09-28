"use server";

import { allowAccess } from "@/utils/access";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Language } from "@/types/submission";
import { messages } from "@/config/messages";
import { redirect } from "next/navigation";
import { submitSchema } from "@/lib/zod/judge";
import { verifyTurnstile } from "@/lib/turnstile";

export async function submitCode(data: FormData) {
    let submissionId: number;

    try {
        const token = data.get("turnstileToken") as string;

        const captchaResult = await verifyTurnstile(token);
        if (!captchaResult.success) {
            return {
                error: captchaResult.error,
            };
        }

        const accessResult = await allowAccess("user", "action");
        if (accessResult) {
            return accessResult;
        }

        const problemId = Number(data.get("problemId"));
        const language = data.get("language") as string;
        const code = (data.get("code") as string).trim();

        const parsed = submitSchema.safeParse({
            language,
            code,
        });
        if (!parsed.success || isNaN(problemId)) {
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

        const problem = await prisma.problem.findUnique({
            where: { id: problemId },
        });
        if (!problem) {
            return {
                error: messages.database.noProblem,
            };
        }
        if (problem.visibility === "private" && user.role !== "admin") {
            return {
                error: messages.database.privateProblem,
            };
        }

        // Creating the row queues it: judgeStatus defaults to pending and a
        // trigger notifies the judge, which claims it and writes the result
        // back to this same row.
        const submission = await prisma.submission.create({
            data: {
                problemId: problemId,
                userId: user.id,
                language: language as Language,
                code: code,
            },
        });
        submissionId = submission.id;
    } catch (error) {
        console.error(error);
        return {
            error: messages.form.unexpected,
        };
    }
    redirect(`/submission/${submissionId}`);
}
