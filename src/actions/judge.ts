"use server";

import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";
import { Language } from "@/types/submission";
import { messages } from "@/config/messages";
import { redirect } from "next/navigation";
import { submitSchema } from "@/lib/zod/judge";

const protocol = process.env.BACKEND_PROTOCOL;
const endpoint = process.env.BACKEND_ENDPOINT;
const port = process.env.BACKEND_PORT;

export async function submitCode(data: FormData) {
    let submissionId: number;

    try {
        const accessResult = await allowAccess("user", "action");
        if (accessResult) {
            return accessResult;
        }

        const problemId = Number(data.get("problemId"));
        const userId = Number(data.get("userId"));
        const language = data.get("language") as string;
        const code = data.get("code") as string;

        const parsed = submitSchema.safeParse({
            language,
            code,
        });
        if (!parsed.success || isNaN(problemId) || isNaN(userId)) {
            return {
                error: messages.form.invalid,
            };
        }

        const problem = await prisma.problem.findUnique({
            where: { id: problemId },
        });
        if (!problem) {
            return {
                error: messages.database.noProblem,
            }
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return {
                error: messages.database.noUser,
            }
        }

        const submission = await prisma.submission.create({
            data: {
                problemId: problemId,
                userId: userId,
                language: language as Language,
                code: code,
                verdict: [
                    "Pending"
                ],
            },
        });
        submissionId = submission.id;

        data.append("id", submission.id.toString());
        data.append("timeLimit", problem.timeLimit.toString());
        data.append("memoryLimit", problem.memoryLimit.toString());
        data.append("testcases", problem.testcases.toString());
        data.delete("userId");

        const response = await fetch(`${protocol}://${endpoint}:${port}/submit`, {
            method: "POST",
            body: data,
        });

        if (!response.ok) {
            return {
                error: messages.form.unexpected
            };
        }

        getSubmission(submission.id);
    } catch (error) {
        console.error(error);
        return {
            error: messages.form.unexpected,
        };
    }
    redirect(`/submission/${submissionId}`);
}

export async function getSubmission(id: number) {
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`${protocol}://${endpoint}:${port}/submission/${id}`, {
                cache: "no-cache",
            });

            if (!response.ok) {
                return { error: messages.form.unexpected };
            }

            const json = await response.json();

            if (json.error) {
                return { error: json.error };
            }

            if (json.result) {
                const result = json.result;
                const error = result[0].error;
                const score = json.score ?? 0;

                const verdict = result.map((item: any) => item.verdict);
                const time = result.map((item: any) => Number(item.time ?? 0));
                const memory = result.map((item: any) => Number(item.memory ?? 0));

                await prisma.submission.update({
                    where: { id },
                    data: {
                        score,
                        verdict,
                        time,
                        memory,
                        error,
                    },
                });

                const submission = await prisma.submission.findUnique({
                    where: { id },
                    include: {
                        problem: true
                    },
                });
                if (!submission) {
                    return { error: messages.database.noSubmission };
                }

                const isAccepted = submission.score === submission.problem.testcases;

                const userProblem = await prisma.userProblem.findFirst({
                    where: {
                        userId: submission.userId,
                        problemId: submission.problemId,
                    },
                });
                if (userProblem) {
                    const latestSubmission = userProblem.submissionId;
                    if (submission.id >= latestSubmission) {
                        await prisma.userProblem.update({
                            where: {
                                userId_problemId: {
                                    userId: submission.userId,
                                    problemId: submission.problemId,
                                },
                            },
                            data: {
                                submissionId: submission.id,
                                isAccepted: isAccepted,
                            },
                        });
                    }
                } else {
                    await prisma.userProblem.create({
                        data: {
                            userId: submission.userId,
                            problemId: submission.problemId,
                            submissionId: submission.id,
                            isAccepted: isAccepted,
                        },
                    });
                }

                await fetch(`${protocol}://${endpoint}:${port}/submission/${id}/finished`);

                clearInterval(interval);
                return;
            }

            await prisma.submission.update({
                where: { id },
                data: {
                    verdict: [
                        json.verdict
                    ],
                },
            });
        } catch (error) {
            console.error(error);
            return {
                error: messages.form.unexpected,
            };
        }
    }, 500);
}
