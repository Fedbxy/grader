"use server";

import { allowAccess } from "@/utils/access";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Language } from "@/types/submission";
import { RunActionResult } from "@/types/run";
import { messages } from "@/config/messages";
import { limits } from "@/config/limits";
import { runSchema } from "@/lib/zod/judge";

// Runs the user's code on their own input without submitting (#67). No
// captcha: the active-run and per-minute limits below are the protection.
export async function runCode(data: FormData): Promise<RunActionResult> {
    try {
        const accessResult = await allowAccess("user", "action");
        if (accessResult) {
            return { error: accessResult.error ?? messages.form.unexpected };
        }

        const problemId = Number(data.get("problemId"));
        const language = data.get("language") as string;
        const code = (data.get("code") as string).trim();
        // Not trimmed: whitespace and the final newline are part of stdin.
        // But multipart encoding turns the textarea's newlines into CRLF, and
        // a stray "\r" breaks input() in Python and getline in C++.
        const input = (data.get("input") as string).replace(/\r\n?/g, "\n");

        const parsed = runSchema.safeParse({
            language,
            code,
            input,
        });
        if (!parsed.success || isNaN(problemId)) {
            // The only error the form can't prevent is oversized input.
            const tooLarge = !parsed.success && parsed.error.issues.some(
                (issue) => issue.path[0] === "input",
            );
            return {
                error: tooLarge ? messages.run.inputTooLarge : messages.form.invalid,
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

        // Runs expire here rather than in the judge: the website owns the
        // table and its retention, and this is one indexed delete on
        // createdAt. It covers every user's runs, so the table stays small
        // as long as anyone runs anything.
        const now = Date.now();
        await prisma.run.deleteMany({
            where: {
                createdAt: { lt: new Date(now - limits.run.ttlMinutes * 60 * 1000) },
            },
        });

        // Under a per-user lock: two quick clicks would otherwise both read
        // the same bucket and both replace the same row.
        const result = await prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(67, ${user.id})`;

            const previous = await tx.run.findUnique({
                where: { userId: user.id },
                select: { id: true, runTokens: true, runTokensAt: true },
            });

            // The token bucket: what was left after the last run, plus one
            // for every refillSeconds since, never more than a full bucket.
            // No previous run (or it expired) means a full one.
            const refillMs = limits.run.refillSeconds * 1000;
            const tokens = previous
                ? Math.min(
                      limits.run.tokens,
                      previous.runTokens +
                          (now - previous.runTokensAt.getTime()) / refillMs,
                  )
                : limits.run.tokens;
            if (tokens < 1) {
                const wait = Math.ceil(((1 - tokens) * refillMs) / 1000);
                return { error: messages.run.rateLimited(wait) };
            }

            // One run per user: the new one replaces the last, queued or not.
            // A new row rather than an update, so a judge still busy with the
            // old run writes its result into a row that no longer exists.
            if (previous) {
                await tx.run.delete({ where: { id: previous.id } });
            }

            // Creating the row queues it, like a submission: judgeStatus
            // defaults to pending and a trigger notifies the judge, which
            // writes the result back to this same row.
            const run = await tx.run.create({
                data: {
                    userId: user.id,
                    problemId: problemId,
                    language: language as Language,
                    code: code,
                    input: input,
                    runTokens: tokens - 1,
                    runTokensAt: new Date(now),
                },
            });
            return { runId: run.id };
        });
        return result;
    } catch (error) {
        console.error(error);
        return {
            error: messages.form.unexpected,
        };
    }
}
