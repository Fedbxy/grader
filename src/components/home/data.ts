import Decimal from "decimal.js";
import prisma from "@/lib/prisma";
import { submissionListSelect } from "@/lib/select";
import {
  getUpNextProblems,
  getViewerAcceptance,
  getViewerBestFractions,
  getViewerProblemStatuses,
  type UpNextProblem,
} from "@/utils/accepted";
import { scoreFraction, subtaskDisplay } from "@/utils/score";
import { visibleSubmissionsWhere } from "@/utils/submission";
import { firstFailure, submissionVerdict } from "@/utils/verdict";
import { lastTryNote } from "./format";
import type { SubmissionRow } from "@/types/submission";
import type { Role } from "@/types/user";

const POINTS_COUNT = 5;
const RECENT_COUNT = 5;
const UP_NEXT_COUNT = 3;
// A submission older than this no longer counts as "in the middle of it".
const CONTINUE_DAYS = 14;
// Attempts read to find the best one of the Continue problem.
const CONTINUE_ATTEMPTS = 200;
const EXCERPT_LENGTH = 240;

type Viewer = { id: number; role: Role; displayName: string };

type Limits = { timeLimit: number; memoryLimit: number };

export type ContinueData = {
  problem: { id: number; title: string; score: number } & Limits;
  lastTouched: string;
  // Points of the best judged attempt, and how many attempts there are.
  bestScore: number;
  bestFraction: number;
  attempts: number;
  // The submission the grid describes: the best judged one, else the latest.
  submissionId: number;
  subtasks: { verdicts: string[]; earned: number; full: number; firstTest: number }[];
  failure: { verdict: string; position: number } | null;
};

export type PointsRow = {
  id: number;
  title: string;
  best: number;
  bestFraction: number;
  left: number;
  score: number;
  note: string | null;
  lastTry: string | null;
};

export type HomeData = {
  judging: { id: number; status: string; problem: { title: string; testcases: number } } | null;
  judgingCount: number;
  continue: ContinueData | null;
  points: { rows: PointsRow[]; problems: number };
  recent: SubmissionRow[];
  progress: { solved: number; partial: number; failed: number; untried: number; total: number; acceptance: number | null };
  upNext: UpNextProblem[];
  announcement: { id: number; title: string; excerpt: string; author: string; updatedAt: string } | null;
  hasSubmissions: boolean;
};

// The text of an announcement's content, for an excerpt. The editor stores
// HTML; a ProseMirror JSON document is read too, by walking its text nodes.
function plainText(content: string): string {
  let text: string;
  try {
    const doc = JSON.parse(content);
    const parts: string[] = [];
    const walk = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      const { text: value, content: children } = node as { text?: unknown; content?: unknown };
      if (typeof value === "string") parts.push(value);
      if (Array.isArray(children)) {
        children.forEach(walk);
        parts.push(" ");
      }
    };
    walk(doc);
    text = parts.join("");
  } catch {
    text = content
      .replace(/<\/(p|h[1-6]|li|div|blockquote|pre)>|<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
  }
  text = text.replace(/\s+/g, " ").trim();
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…` : text;
}

// A row's verdict. `result` is untyped JSON in the database; submissionVerdict
// only reads its verdicts.
function verdictOf(
  row: { errorCode: string | null; status: string | null; score: number; result: unknown },
  testcases: number,
) {
  return submissionVerdict({ ...row, result: row.result as { verdicts?: string[][] } | null }, testcases);
}

function points(fraction: Decimal, problemScore: number) {
  return fraction.mul(problemScore).toDecimalPlaces(2).toNumber();
}

// Everything the home page of a signed-in user shows, in a few bounded
// queries. Problems are the public ones, as on /problem; submissions follow
// what the viewer may open.
export async function getHomeData(user: Viewer): Promise<HomeData> {
  const own = { userId: user.id, ...visibleSubmissionsWhere(user) };
  const running = { judgeStatus: { in: ["pending", "judging"] as ("pending" | "judging")[] } };

  const [
    statuses,
    fractions,
    acceptance,
    totalProblems,
    recentRows,
    submissionCount,
    judgingCount,
    judging,
    latest,
    announcement,
    upNext,
  ] = await Promise.all([
    getViewerProblemStatuses(user.id),
    getViewerBestFractions(user.id),
    getViewerAcceptance(user.id),
    prisma.problem.count({ where: { visibility: "public" } }),
    prisma.submission.findMany({
      where: own,
      orderBy: { id: "desc" },
      take: RECENT_COUNT,
      select: submissionListSelect,
    }),
    prisma.submission.count({ where: own }),
    prisma.submission.count({ where: { ...own, ...running } }),
    prisma.submission.findFirst({
      where: { ...own, ...running },
      orderBy: { id: "desc" },
      select: { id: true, status: true, problem: { select: { title: true, testcases: true } } },
    }),
    // The newest judged submission to a public problem, own hidden ones
    // included. One still judging is in the judging strip, and one with a
    // compile error has no tests to show, so neither picks Continue.
    prisma.submission.findFirst({
      where: { userId: user.id, judgeStatus: "done", errorCode: null, problem: { visibility: "public" } },
      orderBy: { id: "desc" },
      select: {
        createdAt: true,
        problem: { select: { id: true, title: true, score: true, testcases: true, timeLimit: true, memoryLimit: true } },
      },
    }),
    prisma.announcement.findFirst({
      where: { visibility: "public" },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, content: true, updatedAt: true, author: { select: { displayName: true } } },
    }),
    getUpNextProblems(user.id, UP_NEXT_COUNT),
  ]);

  // Tried and not solved: what Progress counts as partial or failed, and what
  // Unfinished draws from.
  const unsolvedIds = [...statuses].filter(([, status]) => !status.isAccepted).map(([id]) => id);
  const zero = new Decimal(0);
  const showContinue =
    latest !== null &&
    Date.now() - latest.createdAt.getTime() < CONTINUE_DAYS * 24 * 60 * 60 * 1000 &&
    statuses.get(latest.problem.id)?.isAccepted === false;

  const [unsolvedProblems, attempts, attemptCount] = await Promise.all([
    unsolvedIds.length > 0
      ? prisma.problem.findMany({
          where: { id: { in: unsolvedIds } },
          select: { id: true, title: true, score: true, testcases: true },
        })
      : [],
    showContinue
      ? prisma.submission.findMany({
          where: { userId: user.id, problemId: latest.problem.id },
          orderBy: { id: "desc" },
          take: CONTINUE_ATTEMPTS,
          select: { id: true, score: true, result: true, errorCode: true, judgeStatus: true },
        })
      : [],
    showContinue ? prisma.submission.count({ where: { userId: user.id, problemId: latest.problem.id } }) : 0,
  ]);

  // Unfinished: the most points left first, the latest try among equals.
  const left = unsolvedProblems
    .map((problem) => {
      const fraction = fractions.get(problem.id) ?? zero;
      return {
        problem,
        fraction,
        left: new Decimal(1).minus(fraction).mul(problem.score).toDecimalPlaces(2),
        latestSubmissionId: statuses.get(problem.id)?.latestSubmissionId ?? 0,
      };
    })
    .filter((row) => row.left.gt(0))
    .sort((a, b) => b.left.cmp(a.left) || b.latestSubmissionId - a.latestSubmissionId);
  const top = left.slice(0, POINTS_COUNT);

  const latestTries =
    top.length > 0
      ? await prisma.submission.findMany({
          where: { id: { in: top.map((row) => row.latestSubmissionId) } },
          select: { id: true, score: true, result: true, status: true, errorCode: true, createdAt: true },
        })
      : [];
  const triesById = new Map(latestTries.map((row) => [row.id, row]));

  const pointsRows: PointsRow[] = top.map((row) => {
    const latestTry = triesById.get(row.latestSubmissionId);
    return {
      id: row.problem.id,
      title: row.problem.title,
      best: points(row.fraction, row.problem.score),
      bestFraction: row.fraction.toNumber(),
      left: row.left.toNumber(),
      score: row.problem.score,
      note: latestTry
        ? lastTryNote(verdictOf(latestTry, row.problem.testcases))
        : null,
      lastTry: latestTry?.createdAt.toISOString() ?? null,
    };
  });

  // Continue: the best judged attempt (the latest among equals) at the
  // problem of the newest submission.
  let continueData: ContinueData | null = null;
  if (showContinue && latest) {
    const { problem } = latest;
    let best: { id: number; fraction: Decimal; result: unknown; score: number } | null = null;
    for (const attempt of attempts) {
      if (attempt.judgeStatus !== "done" || attempt.errorCode) continue;
      const { earned, total } = scoreFraction(attempt.score, attempt.result, problem.testcases);
      const fraction = earned.div(total);
      if (!best || fraction.gt(best.fraction)) {
        best = { id: attempt.id, fraction, result: attempt.result, score: attempt.score };
      }
    }

    const { verdicts, weights, scores } = (best?.result ?? {}) as {
      verdicts?: string[][];
      weights?: number[];
      scores?: number[];
    };
    const totalWeight = weights?.reduce((a, b) => a + b, 0) || problem.testcases;
    let next = 1;
    const subtasks = (verdicts ?? []).map((subtaskVerdicts, i) => {
      const { subtaskScore, subtaskFullScore } = subtaskDisplay(
        scores?.[i] ?? 0,
        subtaskVerdicts.length,
        weights?.[i] ?? 1,
        totalWeight,
        problem.score,
      );
      const firstTest = next;
      next += subtaskVerdicts.length;
      return { verdicts: subtaskVerdicts, earned: subtaskScore, full: subtaskFullScore, firstTest };
    });

    continueData = {
      problem,
      lastTouched: latest.createdAt.toISOString(),
      bestScore: best ? points(best.fraction, problem.score) : 0,
      bestFraction: best?.fraction.toNumber() ?? 0,
      attempts: attemptCount,
      submissionId: best?.id ?? attempts[0]?.id ?? 0,
      subtasks,
      failure: best ? firstFailure(verdicts) : null,
    };
  }

  const solved = statuses.size - unsolvedIds.length;
  const partial = unsolvedIds.filter((id) => fractions.get(id)?.gt(0)).length;

  return {
    judging: judging && { ...judging, status: judging.status ?? "In queue" },
    judgingCount,
    continue: continueData,
    points: {
      rows: pointsRows,
      problems: left.length,
    },
    recent: recentRows,
    progress: {
      solved,
      partial,
      failed: unsolvedIds.length - partial,
      untried: totalProblems - statuses.size,
      total: totalProblems,
      acceptance: acceptance.judged > 0 ? Math.round((acceptance.accepted / acceptance.judged) * 100) : null,
    },
    upNext,
    announcement: announcement && {
      id: announcement.id,
      title: announcement.title,
      excerpt: plainText(announcement.content),
      author: announcement.author.displayName,
      updatedAt: announcement.updatedAt.toISOString(),
    },
    hasSubmissions: submissionCount > 0,
  };
}
