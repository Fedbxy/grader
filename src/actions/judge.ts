"use server";

import { allowAccess } from "@/utils/access";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Language } from "@/types/submission";
import { messages } from "@/config/messages";
import { redirect } from "next/navigation";
import { submitSchema } from "@/lib/zod/judge";
import { verifyTurnstile } from "@/lib/turnstile";

const protocol = process.env.BACKEND_PROTOCOL;
const endpoint = process.env.BACKEND_ENDPOINT;
const port = process.env.BACKEND_PORT;

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

        const submission = await prisma.submission.create({
            data: {
                problemId: problemId,
                userId: user.id,
                language: language as Language,
                code: code,
            },
        });
        submissionId = submission.id;

        data.append("id", submission.id.toString());
        data.append("timeLimit", problem.timeLimit.toString());
        data.append("memoryLimit", problem.memoryLimit.toString());
        data.append("testcases", problem.testcases.toString());

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
                clearInterval(interval);
                return {
                    error: messages.form.unexpected
                };
            }

            const json = await response.json();

            if (json.errorCode) {
                const score = json.score;
                const errorCode = json.errorCode;
                const error = json.error;

                await prisma.submission.update({
                    where: { id },
                    data: {
                        score,
                        status: null,
                        result: [],
                        errorCode,
                        error,
                    },
                });

                clearInterval(interval);
                return {
                    error: json.error
                };
            }

            if (json.result) {
                const score = json.score;
                const result = json.result;

                await prisma.submission.update({
                    where: { id },
                    data: {
                        score,
                        status: null,
                        result,
                        errorCode: null,
                        error: null,
                    },
                });

                const submission = await prisma.submission.findUnique({
                    where: { id },
                    include: {
                        problem: true
                    },
                });
                if (!submission) {
                    clearInterval(interval);
                    return {
                        error: messages.database.noSubmission
                    };
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
                    status: json.status,
                },
            });
        } catch (error) {
            clearInterval(interval);
            console.error(error);
            return {
                error: messages.form.unexpected,
            };
        }
    }, 500);
}
