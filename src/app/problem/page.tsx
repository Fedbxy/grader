import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { publicUserSelect } from "@/lib/select";
import Decimal from "decimal.js";
import {
  getAcceptedCounts,
  getViewerBestFractions,
  getViewerProblemStatuses,
  type ViewerProblemStatus,
} from "@/utils/accepted";

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
      author: { select: publicUserSelect },
    },
  });

  const { user } = await validateRequest();

  // Aggregate queries for the whole list, however many problems there are.
  const [acceptedCounts, viewerStatuses, bestFractions] = await Promise.all([
    getAcceptedCounts(),
    user ? getViewerProblemStatuses(user.id) : new Map<number, ViewerProblemStatus>(),
    user ? getViewerBestFractions(user.id) : new Map<number, Decimal>(),
  ]);

  const dataWithAccepted = data.map((problem) => {
    const status = viewerStatuses.get(problem.id);
    const best = bestFractions.get(problem.id);

    return {
      ...problem,
      accepted: acceptedCounts.get(problem.id) ?? 0,
      // undefined when the viewer never submitted, else whether they ever solved it.
      isUserAccepted: status?.isAccepted,
      latestSubmissionId: status?.latestSubmissionId,
      isRunning: status?.isRunning,
      // Rounded once, the same way a submission's score is shown.
      bestScore: status ? (best ? best.mul(problem.score).toDecimalPlaces(2).toNumber() : null) : undefined,
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
        {/* The status column only means something to a signed-in viewer. */}
        <DataTable columns={columns} data={dataWithAccepted} columnVisibility={{ status: !!user }} />
      </div>
    </div>
  );
}
