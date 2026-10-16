import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { publicUserSelect } from "@/lib/select";
import { scoreFraction } from "@/utils/score";
import type { Role } from "@/types/user";
import Decimal from "decimal.js";

// Solved status is derived from `submissions`. (A `user_problems` cache used
// to hold it and went stale on rejudges and compile errors.) The rules live
// here, in one place:
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

export type ViewerProblemStatus = { latestSubmissionId: number; isAccepted: boolean; isRunning: boolean };

// The viewer's own status per public problem they ever submitted to, in ONE
// query: their latest submission id, whether they ever solved it, and whether
// that latest submission is still queued or being judged (hidden submissions of
// their own included). Problems never submitted are absent.
export async function getViewerProblemStatuses(userId: number): Promise<Map<number, ViewerProblemStatus>> {
    const rows = await prisma.$queryRaw<{ problemId: number; latestSubmissionId: number; isAccepted: boolean; isRunning: boolean }[]>(Prisma.sql`
        SELECT s."problemId",
               MAX(s."id") AS "latestSubmissionId",
               BOOL_OR(${ACCEPTED}) AS "isAccepted",
               (ARRAY_AGG(s."judgeStatus" ORDER BY s."id" DESC))[1] IN ('pending', 'judging') AS "isRunning"
        FROM "submissions" s
        JOIN "problems" p ON p."id" = s."problemId"
        WHERE s."userId" = ${userId} AND p."visibility" = 'public'
        GROUP BY s."problemId"
    `);
    return new Map(
        rows.map((row) => [
            row.problemId,
            { latestSubmissionId: row.latestSubmissionId, isAccepted: row.isAccepted, isRunning: row.isRunning },
        ]),
    );
}

// The viewer's best judged result per public problem, as a fraction of the
// problem's score (0 to 1). Only judged submissions without an error code
// count; their own hidden ones included. Problems with none are absent. The
// subtask weighting lives in result JSON, so the maximum is taken here rather
// than in SQL, with the same arithmetic as a submission's score cell.
export async function getViewerBestFractions(userId: number): Promise<Map<number, Decimal>> {
    const rows = await prisma.submission.findMany({
        where: { userId, judgeStatus: "done", errorCode: null, problem: { visibility: "public" } },
        select: { problemId: true, score: true, result: true, problem: { select: { testcases: true } } },
    });
    const best = new Map<number, Decimal>();
    for (const row of rows) {
        const { earned, total } = scoreFraction(row.score, row.result, row.problem.testcases);
        const fraction = earned.div(total);
        const current = best.get(row.problemId);
        if (!current || fraction.gt(current)) best.set(row.problemId, fraction);
    }
    return best;
}

// How many of the viewer's judged submissions to public problems were
// accepted, out of those that were judged without an error code (compile,
// judge and system errors are left out of both numbers). Their own hidden
// submissions count. In ONE query.
export async function getViewerAcceptance(userId: number): Promise<{ accepted: number; judged: number }> {
    const [row] = await prisma.$queryRaw<{ accepted: bigint; judged: bigint }[]>(Prisma.sql`
        SELECT COUNT(*) FILTER (WHERE ${ACCEPTED}) AS accepted, COUNT(*) AS judged
        FROM "submissions" s
        JOIN "problems" p ON p."id" = s."problemId"
        WHERE s."userId" = ${userId} AND p."visibility" = 'public'
          AND s."judgeStatus" = 'done' AND s."errorCode" IS NULL
    `);
    // COUNT comes back as bigint.
    return { accepted: Number(row?.accepted ?? 0), judged: Number(row?.judged ?? 0) };
}

export type UpNextProblem = {
    id: number;
    title: string;
    timeLimit: number;
    memoryLimit: number;
    // Whole percent of the users who tried it that solved it; null when nobody
    // (hidden submissions aside) has tried it yet.
    solveRate: number | null;
};

// Public problems the viewer never submitted to, the easiest first: by solve
// rate (distinct accepted users over distinct users who tried, hidden
// submissions excluded), problems nobody tried last, then the newest. In ONE
// query, limited in SQL.
export async function getUpNextProblems(userId: number, limit: number): Promise<UpNextProblem[]> {
    const rows = await prisma.$queryRaw<
        { id: number; title: string; timeLimit: number; memoryLimit: number; tried: bigint; accepted: bigint }[]
    >(Prisma.sql`
        SELECT p."id", p."title", p."timeLimit", p."memoryLimit",
               COUNT(DISTINCT s."userId") AS tried,
               COUNT(DISTINCT s."userId") FILTER (WHERE ${ACCEPTED}) AS accepted
        FROM "problems" p
        LEFT JOIN "submissions" s ON s."problemId" = p."id" AND s."hidden" = false
        WHERE p."visibility" = 'public'
          AND NOT EXISTS (
              SELECT 1 FROM "submissions" own WHERE own."problemId" = p."id" AND own."userId" = ${userId}
          )
        GROUP BY p."id"
        ORDER BY (COUNT(DISTINCT s."userId") FILTER (WHERE ${ACCEPTED}))::float
                     / NULLIF(COUNT(DISTINCT s."userId"), 0) DESC NULLS LAST,
                 p."createdAt" DESC, p."id" DESC
        LIMIT ${limit}
    `);
    // COUNT comes back as bigint.
    return rows.map((row) => ({
        id: row.id,
        title: row.title,
        timeLimit: row.timeLimit,
        memoryLimit: row.memoryLimit,
        solveRate: Number(row.tried) === 0 ? null : Math.round((Number(row.accepted) / Number(row.tried)) * 100),
    }));
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

export type ProfileStats = {
    solved: { id: number; title: string }[];
    attempted: number;
    submissions: number;
};

// What a profile page shows about one user, in ONE query grouped by problem:
// the problems they solved (id order), how many they tried without solving,
// and their total submissions. It counts only what the viewer may see, the
// same rules as the submission lists: admins see everything; anyone else sees
// public problems only, and hidden submissions only when the viewer is that
// user. "Attempted" is a problem with a visible submission and no visible
// accepted one, so a problem solved only by a hidden submission is attempted
// (or absent) for a viewer who can't see it, not solved.
export async function getProfileStats(
    userId: number,
    viewer: { id: number; role: Role } | null,
): Promise<ProfileStats> {
    // The viewer's own id is the only value interpolated, and only when signed in.
    const hiddenOk = viewer ? Prisma.sql`s."hidden" = false OR s."userId" = ${viewer.id}` : Prisma.sql`s."hidden" = false`;
    const visible = viewer?.role === "admin" ? Prisma.sql`TRUE` : Prisma.sql`p."visibility" = 'public' AND (${hiddenOk})`;
    const rows = await prisma.$queryRaw<{ problemId: number; title: string; submissions: bigint; solved: boolean }[]>(Prisma.sql`
        SELECT s."problemId",
               p."title",
               COUNT(*) AS submissions,
               BOOL_OR(${ACCEPTED}) AS solved
        FROM "submissions" s
        JOIN "problems" p ON p."id" = s."problemId"
        WHERE s."userId" = ${userId} AND ${visible}
        GROUP BY s."problemId", p."title"
        ORDER BY s."problemId"
    `);
    const solved = rows.filter((row) => row.solved);
    return {
        solved: solved.map((row) => ({ id: row.problemId, title: row.title })),
        attempted: rows.length - solved.length,
        // COUNT comes back as bigint.
        submissions: rows.reduce((total, row) => total + Number(row.submissions), 0),
    };
}

export type AdminProfileStats = {
    public: { solved: number; attempted: number; submissions: number };
    private: { solved: number; attempted: number; submissions: number };
    all: { solved: number; attempted: number; submissions: number };
    hidden: number;
};

// The admin-only split of getProfileStats: the same solved / attempted /
// submissions numbers per problem visibility, in ONE query grouped by problem,
// plus how many of the user's submissions are hidden. Admins count everything,
// hidden submissions included, so "All" matches what an admin sees in the
// public strip.
export async function getAdminProfileStats(userId: number): Promise<AdminProfileStats> {
    const rows = await prisma.$queryRaw<{ visibility: string; submissions: bigint; hidden: bigint; solved: boolean }[]>(Prisma.sql`
        SELECT p."visibility"::text AS visibility,
               COUNT(*) AS submissions,
               COUNT(*) FILTER (WHERE s."hidden") AS hidden,
               BOOL_OR(${ACCEPTED}) AS solved
        FROM "submissions" s
        JOIN "problems" p ON p."id" = s."problemId"
        WHERE s."userId" = ${userId}
        GROUP BY s."problemId", p."visibility"
    `);
    const empty = () => ({ solved: 0, attempted: 0, submissions: 0 });
    const stats: AdminProfileStats = { public: empty(), private: empty(), all: empty(), hidden: 0 };
    for (const row of rows) {
        // COUNT comes back as bigint.
        const submissions = Number(row.submissions);
        const bucket = row.visibility === "public" ? stats.public : stats.private;
        for (const target of [bucket, stats.all]) {
            target[row.solved ? "solved" : "attempted"]++;
            target.submissions += submissions;
        }
        stats.hidden += Number(row.hidden);
    }
    return stats;
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
