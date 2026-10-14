"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Problem } from "@/types/problem";
import Link from "next/link";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileText, MoreHorizontal, FileCheck2, Send, ListChecks, Circle, CircleCheck, CircleDashed, CircleX } from "lucide-react";
import { useSubmission } from "@/hooks/submission";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/table/column-header";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AcceptedUsersDialog } from "./acceptedUsers";
import { Badge } from "@/components/ui/badge";

type ProblemWithAccepted = Problem & {
  accepted: number;
  // The signed-in viewer's own status; all undefined when they never submitted.
  isUserAccepted?: boolean;
  latestSubmissionId?: number;
  // Whether that latest submission is still queued or being judged.
  isRunning?: boolean;
  // Their best judged score in points, or null when nothing was judged yet.
  bestScore?: number | null;
};

// Sort order for the status column: solved, partial scores (highest share
// first), running, scored nothing, never submitted.
function statusRank({ isUserAccepted, isRunning, bestScore, score }: ProblemWithAccepted) {
  if (isUserAccepted === undefined) return 0;
  if (isUserAccepted) return 4;
  if (isRunning) return 1.5;
  if (bestScore) return 2 + bestScore / score;
  return 1;
}

// Polls the viewer's latest submission while it is judged, the way the
// submission page does, and refreshes the list once it finishes so the status
// is recomputed. Refreshes once per mount, so a stale flag cannot loop.
function RunningStatus({ submissionId }: { submissionId: number }) {
  const router = useRouter();
  const { isLoading, isRunning } = useSubmission(submissionId);
  const refreshed = useRef(false);
  const finished = !isLoading && !isRunning;

  useEffect(() => {
    if (finished && !refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
  }, [finished, router]);

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-muted-foreground">
      <LoadingSpinner className="h-4 w-4" />
      Running
    </span>
  );
}

function StatusCell({ problem }: { problem: ProblemWithAccepted }) {
  const { isUserAccepted, isRunning, latestSubmissionId, bestScore, score } = problem;
  const item = "inline-flex items-center gap-1.5 whitespace-nowrap";

  if (isUserAccepted === undefined) {
    return (
      <span className={`${item} text-muted-foreground`}>
        <Circle className="h-4 w-4" />
        Unsolved
      </span>
    );
  }
  if (isUserAccepted) {
    return (
      <span className={`${item} font-medium text-constructive dark:text-green-400`}>
        <CircleCheck className="h-4 w-4" />
        Solved
      </span>
    );
  }
  if (isRunning && latestSubmissionId) {
    return <RunningStatus submissionId={latestSubmissionId} />;
  }
  if (bestScore) {
    return (
      <span className={`${item} font-medium text-amber-600 tabular-nums dark:text-amber-400`}>
        <CircleDashed className="h-4 w-4" />
        {bestScore} / {score}
      </span>
    );
  }
  // Submitted, but every judged result scored nothing (or only compile errors).
  return (
    <span className={`${item} font-medium text-destructive tabular-nums`}>
      <CircleX className="h-4 w-4" />
      0 / {score}
    </span>
  );
}

export const columns: ColumnDef<ProblemWithAccepted>[] = [
  {
    id: "status",
    accessorFn: statusRank,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusCell problem={row.original} />,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    // Narrow and muted: a reference number, not something to read first.
    meta: { headerClassName: "w-16" },
    cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.original.id}</span>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const { title, id } = row.original;

      return (
        <Link href={`/problem/${id}/statement`} className="font-medium text-primary hover:underline">
          {title}
        </Link>
      );
    },
  },
  {
    id: "limits",
    header: "Limits",
    cell: ({ row }) => {
      const { timeLimit, memoryLimit } = row.original;
      const time = `${timeLimit / 1000} ${timeLimit === 1000 ? "second" : "seconds"}`;
      const memory = `${memoryLimit} MB`;

      return (
        <div className="flex flex-col items-start gap-1 whitespace-nowrap md:flex-row">
          <Badge variant="outline">{time}</Badge>
          <Badge variant="outline">{memory}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "author",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Author" />
    ),
    cell: ({ row }) => {
      const author = row.original.author;

      return (
        <Link href={`/user/${author.id}/profile`} className="link">
          {author.displayName}
        </Link>
      );
    },
  },
  {
    accessorKey: "accepted",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Solved by" />
    ),
    cell: ({ row }) => {
      const accepted = row.original.accepted;

      return accepted ? (
        <AcceptedUsersDialog accepted={accepted} problemId={row.original.id} />
      ) : (
        <span>{accepted}</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const problem = row.original;
      const latestSubmissionId = problem.latestSubmissionId;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/problem/${problem.id}/statement`}>
                <FileText className="mr-1 h-4 w-4" />
                Statement
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/problem/${problem.id}/submit`}>
                <Send className="mr-1 h-4 w-4" />
                Submit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/problem/${problem.id}/submission`}>
                <ListChecks className="mr-1 h-4 w-4" />
                Submissions
              </Link>
            </DropdownMenuItem>
            {latestSubmissionId && (
              <DropdownMenuItem asChild>
                <Link href={`/submission/${latestSubmissionId}`}>
                  <FileCheck2 className="mr-1 h-4 w-4" />
                  My Latest Submission
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
