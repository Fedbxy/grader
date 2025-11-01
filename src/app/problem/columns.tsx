"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Problem } from "@/types/problem";
import Link from "next/link";

import { FileText, MoreHorizontal, FileCheck2, Check, X } from "lucide-react";
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
  isUserAccepted?: boolean;
  latestSubmissionId?: number;
};

export const columns: ColumnDef<ProblemWithAccepted>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const { title, id } = row.original;

      return (
        <Link href={`/problem/${id}/statement`} className="link">
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
      <DataTableColumnHeader column={column} title="Accepted" />
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
      const isUserAccepted = problem.isUserAccepted;
      const latestSubmissionId = problem.latestSubmissionId;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`h-8 w-8 p-0 ${isUserAccepted !== undefined ? (isUserAccepted ? "bg-constructive/15 text-constructive" : "bg-destructive/15 text-destructive") : ""}`}
            >
              {isUserAccepted !== undefined ? (
                isUserAccepted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link href={`/problem/${problem.id}/statement`}>
              <DropdownMenuItem>
                <FileText className="mr-1 h-4 w-4" />
                Open
              </DropdownMenuItem>
            </Link>
            {latestSubmissionId && (
              <Link href={`/submission/${latestSubmissionId}`}>
                <DropdownMenuItem>
                  <FileCheck2 className="mr-1 h-4 w-4" />
                  Latest Submission
                </DropdownMenuItem>
              </Link>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
