"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { allowAccess } from "@/utils/access";
import { editProblemSchema } from "@/lib/zod/problem";
import { Visibility } from "@/types/problem";
import { redirect } from "next/navigation";
import { messages } from "@/config/messages";
import { uploadFile } from "@/lib/minio";
import { uploadTestcase } from "@/utils/uploadTestcase";

export async function editProblem(id: number, data: FormData) {
    try {
        const accessResult = await allowAccess("admin", "action");
        if (accessResult) {
            return accessResult;
        }

        const title = data.get("title") as string;
        const statement = data.get("statement") as File || undefined;
        const testcase = data.get("testcase") as File || undefined;
        const visibility = data.get("visibility") as Visibility;
        const timeLimit = data.get("timeLimit") as string;
        const memoryLimit = data.get("memoryLimit") as string;
        const score = data.get("score") as string;
        const testcases = data.get("testcases") as string;

        const parsed = editProblemSchema.safeParse({
            title,
            statement,
            testcase,
            visibility,
            timeLimit,
            memoryLimit,
            score,
            testcases,
        });
        if (!parsed.success) {
            return {
                error: messages.form.invalid,
            };
        }

        const problem = await prisma.problem.findUnique({
            where: { id },
        });
        if (!problem) {
            return {
                error: messages.database.noProblem,
            };
        }

        const updateData: any = {};

        if (title !== problem.title) {
            updateData.title = title;
        }

        if (statement) {
            await uploadFile(`problem/${id}/statement.pdf`, statement);
        }

        if (testcase) {
            await uploadTestcase(id, testcase);
        }

        if (visibility !== problem.visibility) {
            updateData.visibility = visibility;
        }

        if (parseInt(timeLimit) !== problem.timeLimit) {
            updateData.timeLimit = parseInt(timeLimit);
        }

        if (parseInt(memoryLimit) !== problem.memoryLimit) {
            updateData.memoryLimit = parseInt(memoryLimit);
        }

        if (parseInt(score) !== problem.score) {
            updateData.score = parseInt(score);
        }

        if (parseInt(testcases) !== problem.testcases) {
            updateData.testcases = parseInt(testcases);
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.problem.update({
                where: { id },
                data: updateData,
            });
        } else if (!statement && !testcase) {
            return {
                error: messages.form.noChanges,
            };
        }
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: messages.form.unexpected,
        };
    }
    redirect("/dashboard/problem");
}

export async function createProblem(data: FormData) {
    try {
        const accessResult = await allowAccess("admin", "action");
        if (accessResult) {
            return accessResult;
        }

        const title = data.get("title") as string;
        const statement = data.get("statement") as File || undefined;
        const testcase = data.get("testcase") as File || undefined;
        const visibility = data.get("visibility") as Visibility;
        const timeLimit = data.get("timeLimit") as string;
        const memoryLimit = data.get("memoryLimit") as string;
        const score = data.get("score") as string;
        const testcases = data.get("testcases") as string;

        const parsed = editProblemSchema.safeParse({
            title,
            statement,
            testcase,
            visibility,
            timeLimit,
            memoryLimit,
            score,
            testcases,
        });
        if (!parsed.success) {
            return {
                error: messages.form.invalid,
            };
        }

        const { user } = await validateRequest();
        if (!user) {
            return {
                error: messages.auth.noSession,
            };
        }

        const newProblem = await prisma.problem.create({
            data: {
                title,
                visibility,
                timeLimit: parseInt(timeLimit),
                memoryLimit: parseInt(memoryLimit),
                score: parseInt(score),
                testcases: parseInt(testcases),
                authorId: user.id,
            },
        });

        if (statement) {
            await uploadFile(`problem/${newProblem.id}/statement.pdf`, statement);
        }

        if (testcase) {
            await uploadTestcase(newProblem.id, testcase);
        }
    } catch (error) {
        console.error("Error: ", error);
        return {
            error: messages.form.unexpected,
        };
    }
    redirect("/dashboard/problem");
}