"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SubmissionRow } from "@/types/submission";
import Link from "next/link";

import { DataTableColumnHeader } from "@/components/table/column-header";
import { ScoreCell } from "./score-cell";
import { TimeCell } from "./time-cell";
import { MemoryCell } from "./memory-cell";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronRight, EyeOff, Info, Share2 } from "lucide-react";
import { VerdictCell } from "./verdict-cell";
import { RelativeTime } from "@/components/relative-time";

// A column pinned to the table's right edge, with a fading, blurring strip on
// its left. Its colour matches what the table sits on: the page or a card.
const PINNED =
  "sticky right-0 bg-background in-data-[slot=card]:bg-card before:pointer-events-none before:absolute before:inset-y-0 before:right-full before:w-8 before:bg-linear-to-l before:from-background in-data-[slot=card]:before:from-card before:to-transparent before:backdrop-blur-[2px] before:mask-l-from-0% before:transition-opacity";

// The hidden and shared icons after a submission's number, with tooltips.
export function SubmissionFlags({
  hidden,
  codePublic,
}: {
  hidden: boolean;
  codePublic: boolean;
}) {
  return (
    <>
      {hidden && (
        <Tooltip>
          <TooltipTrigger asChild>
            <EyeOff
              className="h-3.5 w-3.5 text-muted-foreground"
              aria-label="Hidden"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Hidden</p>
          </TooltipContent>
        </Tooltip>
      )}
      {codePublic && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Share2
              className="h-3.5 w-3.5 text-muted-foreground"
              aria-label="Code shared"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Code shared</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}

export const columns: ColumnDef<SubmissionRow>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => {
      const { id, hidden, codePublic } = row.original;

      return (
        <span className="flex items-center gap-1">
          <span className="font-medium">{id}</span>
          <SubmissionFlags hidden={hidden} codePublic={codePublic} />
        </span>
      );
    },
  },
  {
    accessorKey: "problem",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Problem" />
    ),
    cell: ({ row }) => {
      const problem = row.original.problem;

      return (
        <Link href={`/problem/${problem.id}`} className="link-underlined">
          {problem.title}
        </Link>
      );
    },
  },
  {
    accessorKey: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original.user;

      return (
        <Link href={`/user/${user.id}/profile`} className="link-underlined">
          {user.displayName}
        </Link>
      );
    },
  },
  {
    id: "verdict",
    header: "Verdict",
    cell: ({ row }) => {
      const submission = row.original;

      return (
        <VerdictCell
          submissionId={submission.id}
          testcases={submission.problem.testcases}
        />
      );
    },
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Score" />
    ),
    cell: ({ row }) => {
      const submission = row.original;

      return (
        <ScoreCell
          submissionId={submission.id}
          problemScore={submission.problem.score}
          testcases={submission.problem.testcases}
        />
      );
    },
  },
  {
    accessorKey: "time",
    header: () => (
      <Tooltip>
        <TooltipTrigger className="flex items-center space-x-1 text-nowrap">
          <span>Execution Time</span>
          <Info className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>
          <p>The maximum time taken by any testcase.</p>
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => {
      const submission = row.original;

      return (
        <TimeCell
          submissionId={submission.id}
          timeLimit={submission.problem.timeLimit}
        />
      );
    },
  },
  {
    accessorKey: "memory",
    header: () => (
      <Tooltip>
        <TooltipTrigger className="flex items-center space-x-1 text-nowrap">
          <span>Memory Used</span>
          <Info className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>
          <p>The maximum memory used by any testcase.</p>
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => {
      const submission = row.original;

      return (
        <MemoryCell
          submissionId={submission.id}
          memoryLimit={submission.problem.memoryLimit}
        />
      );
    },
  },
  {
    id: "createdAt",
    accessorFn: (row) => new Date(row.createdAt).getTime(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted" />
    ),
    cell: ({ row }) => {
      const { createdAt } = row.original;

      return (
        <span className="text-nowrap">
          <RelativeTime date={new Date(createdAt).toISOString()} />
        </span>
      );
    },
  },
  {
    // The whole row opens the submission; this link says so before you hover,
    // and is how keyboards get there. It stays pinned to the right edge, where
    // a narrow screen would otherwise scroll it out of view; what scrolls under
    // it fades and blurs out instead of being cut off. While the row is
    // highlighted it lets the row's colour through, fade included.
    id: "open",
    header: () => null,
    meta: {
      headerClassName: `w-8 ${PINNED}`,
      cellClassName: `${PINNED} group-hover/row:bg-transparent group-hover/row:before:opacity-0 group-has-[a:focus-visible]/row:bg-transparent group-has-[a:focus-visible]/row:before:opacity-0`,
    },
    cell: ({ row }) => (
      // The row's one tab stop: its own focus ring gives way to the row's.
      <Link
        href={`/submission/${row.original.id}`}
        aria-label={`Open submission ${row.original.id}`}
        className="block rounded-sm outline-none"
      >
        <ChevronRight
          aria-hidden
          className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover/row:text-foreground group-has-[a:focus-visible]/row:text-foreground"
        />
      </Link>
    ),
  },
];
