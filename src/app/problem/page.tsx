import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { Announcement } from "@/components/announcement/announcement";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Problems",
};

export default async function Page() {
  const data = await prisma.problem.findMany({
    orderBy: {
      id: "asc",
    },
    where: {
      visibility: "public",
    },
    include: {
      author: true,
      UserProblem: {
        select: {
          isAccepted: true,
        },
      },
    },
  });

  const { user: validateUser } = await validateRequest();
  let user = null;
  if (validateUser) {
    user = await prisma.user.findUnique({
      where: {
        id: validateUser.id,
      },
      select: {
        UserProblem: true,
      },
    });
  }

  const dataWithAccepted = data.map((problem) => {
    const accepted = problem.UserProblem.filter(
      (userProblem) => userProblem.isAccepted,
    ).length;
    const userProblem = user?.UserProblem.find(
      (userProblem) => userProblem.problemId === problem.id,
    );
    const isUserAccepted = userProblem?.isAccepted;
    const latestSubmissionId = userProblem?.submissionId;

    return {
      ...problem,
      accepted,
      isUserAccepted,
      latestSubmissionId,
    };
  });

  return (
    <div>
      <Announcement />
      <Separator />
      <div className="container mx-auto flex flex-col space-y-2 py-10">
        <h1 className="text-2xl font-semibold">Problems</h1>
        <h2 className="text-sm text-muted-foreground">
          Select a problem to view its statement and submit a solution.
        </h2>
        <DataTable columns={columns} data={dataWithAccepted} />
      </div>
    </div>
  );
}
