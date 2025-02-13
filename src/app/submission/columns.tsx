"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Submission } from "@/types/submission";
import Link from "next/link";

import { DataTableColumnHeader } from "@/components/table/column-header";
import { ScoreCell } from "@/components/table/submission/score-cell";
import { ActionsButton } from "@/components/table/submission/actions-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
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
        <Link href={`/submit/${problem.id}`} className="link">
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

      const maxTime = Math.max(...submission.time);
      const isExceeded = maxTime >= submission.problem.timeLimit;

      return (
        <span className={isExceeded ? "text-destructive" : ""}>
          {maxTime} ms
        </span>
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

      const maxMemory = Math.max(...submission.memory);
      const isExceeded = maxMemory >= submission.problem.memoryLimit * 1024;

      return (
        <span className={isExceeded ? "text-destructive" : ""}>
          {maxMemory} KB
        </span>
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
