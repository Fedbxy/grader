"use server";

import prisma from "@/lib/prisma";
import { Language } from "@/utils/types";
import { messages } from "@/config/messages";
import { redirect } from "next/navigation";

const protocol = process.env.BACKEND_PROTOCOL;
const endpoint = process.env.BACKEND_ENDPOINT;
const port = process.env.BACKEND_PORT;

export async function submitCode(data: FormData) {
    const problem = await prisma.problem.findUnique({
        where: { id: Number(data.get("problemId")) },
    });
    if (!problem) {
        return {
            error: messages.database.noProblem,
        }
    }

    const submission = await prisma.submission.create({
        data: {
            problemId: Number(data.get("problemId")),
            userId: Number(data.get("userId")),
            language: data.get("language") as Language,
            code: data.get("code") as string,
            verdict: [
                "Pending"
            ],
        },
    });

    data.append("id", submission.id.toString());
    data.append("problem_id", problem.id.toString());
    data.append("time_limit", problem.timeLimit.toString());
    data.append("memory_limit", problem.memoryLimit.toString());
    data.append("testcases", problem.testcases.toString());
    data.delete("userId");
    data.delete("problemId");

    // handle fetch failed (e.g. backend down)
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

    redirect(`/submission/${submission.id}`);
}

export async function getSubmission(id: number) {
    const interval = setInterval(async () => {
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
    }, 100);
}
