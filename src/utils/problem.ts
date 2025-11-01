import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Language } from "@/types/submission";

export type ProblemData = {
  problem: {
    id: number;
    title: string;
    visibility: string;
    timeLimit: number;
    memoryLimit: number;
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
    const UserProblem = await prisma.userProblem.findUnique({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: problem.id,
        },
      },
      include: {
        submission: {
          select: {
            code: true,
            language: true,
          },
        },
      },
    });

    const submission = UserProblem?.submission;
    latestCode = submission ? submission.code : "";
    latestLanguage = submission ? submission.language : undefined;
  }

  return { problem, user, latestCode, latestLanguage };
}
