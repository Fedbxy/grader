"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Submission } from "@/types/submission";
import Link from "next/link";
import { maps } from "@/config/messages";

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
import { Progress } from "@/components/ui/progress";

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
      const verdict = row.original.verdict;

      if (verdict.length === 1 && !(verdict[0] in maps.submission.verdict)) {
        return verdict[0];
      }

      const score = row.original.score;
      const maxScore = row.original.problem.score;
      const testcases = row.original.problem.testcases;

      return (
        <div className="flex flex-col">
          <span>{(score * maxScore) / testcases} pts.</span>
          <Progress
            className="h-2 w-16 md:w-32"
            value={(score * 100) / testcases}
          />
        </div>
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
            <Button variant="ghost" className="h-8 w-8 p-0">
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
