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
import { EyeOff, Info } from "lucide-react";
import { ActionsButton } from "./actions-button";

export const columns: ColumnDef<SubmissionRow>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => {
      const { id, hidden } = row.original;

      return (
        <span className="flex items-center gap-1">
          {id}
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
        </span>
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
        <Link href={`/user/${user.id}/profile`} className="link">
          {user.displayName}
        </Link>
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
        <Link href={`/problem/${problem.id}/statement`} className="link">
          {problem.title}
        </Link>
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
    id: "actions",
    cell: ({ row }) => {
      const submission = row.original;

      return (
        <Link href={`/submission/${submission.id}`}>
          <ActionsButton
            submissionId={submission.id}
            testcases={submission.problem.testcases}
          />
        </Link>
      );
    },
  },
];
