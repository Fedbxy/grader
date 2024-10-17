"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Submission } from "@/types/submission";
import Link from "next/link";

import { Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/table/column-header";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScoreCell } from "@/components/table/submission/score-cell";

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
        <Link href={`/user/${user.id}/profile`} className="hover:underline">
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
        <Link href={`/submit/${problem.id}`} className="hover:underline">
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
    id: "actions",
    cell: ({ row }) => {
      const submission = row.original;

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
            <Link href={`/submission/${submission.id}`}>
              <DropdownMenuItem>
                <Eye className="mr-1 h-4 w-4" />
                View
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
