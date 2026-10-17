import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getLatestSubmissionCode } from "@/utils/accepted";
import { notFound } from "next/navigation";
import type { Language } from "@/types/submission";
import { submissionListSelect } from "@/lib/select";
import { visibleSubmissionsWhere } from "@/utils/submission";

export type ProblemData = {
  problem: {
    id: number;
    title: string;
    visibility: string;
    timeLimit: number;
    memoryLimit: number;
    score: number;
    author: { id: number; displayName: string };
  };
  user: any | null;
  latestCode: string;
  latestLanguage?: Language;
};

export async function getProblemData(id: number): Promise<ProblemData> {
  const { user } = await validateRequest();

  const problem = await prisma.problem.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      visibility: true,
      timeLimit: true,
      memoryLimit: true,
      score: true,
      author: { select: { id: true, displayName: true } },
    },
  });

  if (!problem) {
    notFound();
  }

  if (problem.visibility === "private" && user?.role !== "admin") {
    notFound();
  }

  let latestCode = "";
  let latestLanguage: Language | undefined = undefined;
  if (user) {
    const submission = await getLatestSubmissionCode(user.id, problem.id);
    latestCode = submission ? submission.code : "";
    latestLanguage = submission ? submission.language : undefined;
  }

  return { problem, user, latestCode, latestLanguage };
}

// A problem's submissions as the viewer may see them, newest first: what both
// the workspace's Submissions tab and the problem's submissions page list.
export async function getProblemSubmissions(
  problemId: number,
  user: ProblemData["user"],
) {
  return prisma.submission.findMany({
    where: {
      problemId,
      ...visibleSubmissionsWhere(user),
    },
    orderBy: {
      id: "desc",
    },
    select: submissionListSelect,
  });
}
