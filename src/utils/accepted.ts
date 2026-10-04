import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { publicUserSelect } from "@/lib/select";

// Solved status is derived from `submissions`, never from the `user_problems`
// cache (which the judge still writes but which goes stale on rejudges and
// compile errors). The rules live here, in one place:
//
//   accepted(user, problem): the user has EVER submitted to the problem a
//     submission that is judged ("judgeStatus" = 'done'), has no error code, and
//     passed every testcase (score = problems.testcases, with testcases > 0).
//     Once solved it stays solved, unless a rejudge changes that score.
//   latest(user, problem): the user's submission with the highest id, whatever
//     its status (compile errors and pending ones included).
//
// Public numbers and lists (counts, who solved a problem) skip hidden
// submissions. A viewer's own status (their check mark, their latest
// submission) includes their own hidden ones. Comparing score to
// problems.testcases needs a join, so these are raw queries. Interpolated
// values are bound parameters, never concatenated. They are served by the
// submissions indexes (userId, problemId, id) and (problemId, userId).
//
// Aliases used by the fragments below: s = submissions, p = problems.

const ACCEPTED = Prisma.sql`s."judgeStatus" = 'done' AND s."errorCode" IS NULL AND p."testcases" > 0 AND s."score" = p."testcases"`;

// Distinct non-hidden accepted users per public problem, in ONE query for the
// whole list. Problems nobody solved are absent from the map.
export async function getAcceptedCounts(): Promise<Map<number, number>> {
    const rows = await prisma.$queryRaw<{ problemId: number; accepted: bigint }[]>(Prisma.sql`
        SELECT s."problemId", COUNT(DISTINCT s."userId") AS accepted
        FROM "submissions" s
        JOIN "problems" p ON p."id" = s."problemId"
        WHERE p."visibility" = 'public' AND s."hidden" = false AND ${ACCEPTED}
        GROUP BY s."problemId"
    `);
    // COUNT comes back as bigint.
    return new Map(rows.map((row) => [row.problemId, Number(row.accepted)]));
}

export type ViewerProblemStatus = { latestSubmissionId: number; isAccepted: boolean };

// The viewer's own status per public problem they ever submitted to, in ONE
// query: their latest submission id and whether they ever solved it (hidden
// submissions of their own included). Problems never submitted are absent.
export async function getViewerProblemStatuses(userId: number): Promise<Map<number, ViewerProblemStatus>> {
    const rows = await prisma.$queryRaw<{ problemId: number; latestSubmissionId: number; isAccepted: boolean }[]>(Prisma.sql`
        SELECT s."problemId",
               MAX(s."id") AS "latestSubmissionId",
               BOOL_OR(${ACCEPTED}) AS "isAccepted"
        FROM "submissions" s
        JOIN "problems" p ON p."id" = s."problemId"
        WHERE s."userId" = ${userId} AND p."visibility" = 'public'
        GROUP BY s."problemId"
    `);
    return new Map(
        rows.map((row) => [row.problemId, { latestSubmissionId: row.latestSubmissionId, isAccepted: row.isAccepted }]),
    );
}

type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

// The distinct users who solved one problem, hidden submissions excluded. Only
// the publicUserSelect columns are read, never the whole user row.
export async function listAcceptedUsers(problemId: number): Promise<PublicUser[]> {
    return prisma.$queryRaw<PublicUser[]>(Prisma.sql`
        SELECT u."id", u."displayName"
        FROM "users" u
        WHERE u."id" IN (
            SELECT s."userId"
            FROM "submissions" s
            JOIN "problems" p ON p."id" = s."problemId"
            WHERE s."problemId" = ${problemId} AND s."hidden" = false AND ${ACCEPTED}
        )
        ORDER BY u."id"
    `);
}

// The code and language of the user's latest submission to a problem (highest
// id, any status, hidden included since it is their own), or null if they never
// submitted. Used to prefill the editor.
export function getLatestSubmissionCode(userId: number, problemId: number) {
    return prisma.submission.findFirst({
        where: { userId, problemId },
        orderBy: { id: "desc" },
        select: { code: true, language: true },
    });
}
