"use server";

import prisma from "@/lib/prisma";
import { messages } from "@/config/messages";
import { redirect } from "next/navigation";
import { allowAccess } from "@/lib/auth";
import { getSubmission } from "../judge";

const protocol = process.env.BACKEND_PROTOCOL;
const endpoint = process.env.BACKEND_ENDPOINT;
const port = process.env.BACKEND_PORT;

export async function rejudge(id: number) {
    await allowAccess("admin");

    const submission = await prisma.submission.findUnique({
        where: { id },
    });
    if (!submission) {
        return {
            error: messages.database.noSubmission,
        };
    }

    const problem = await prisma.problem.findUnique({
        where: { id: submission.problemId },
    });
    if (!problem) {
        return {
            error: messages.database.noProblem,
        }
    }

    const data = new FormData();
    data.append("id", submission.id.toString());
    data.append("problem_id", problem.id.toString());
    data.append("time_limit", problem.timeLimit.toString());
    data.append("memory_limit", problem.memoryLimit.toString());
    data.append("testcases", problem.testcases.toString());
    data.append("language", submission.language);
    data.append("code", submission.code);

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
}

export async function rejudgeAllSubmission(problemId: number) {
    await allowAccess("admin");

    const submissions = await prisma.submission.findMany({
        where: { problemId },
        orderBy: {
            id: "asc"
        },
    });

    for (const submission of submissions) {
        await rejudge(submission.id);
    }

    redirect(`/dashboard/submission`);
}