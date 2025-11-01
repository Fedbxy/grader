"use client";

import { columns as mainColumns } from "@/components/submission/columns";
import { ColumnDef } from "@tanstack/react-table";
import { Submission } from "@/types/submission";
import Link from "next/link";

import { ActionsButton } from "@/components/submission/actions-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RejudgeButton } from "./rejudge";
import { Eye } from "lucide-react";

export const columns: ColumnDef<Submission>[] = [
  ...mainColumns.slice(0, -1),
  {
    id: "actions",
    cell: ({ row }) => {
      const submission = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <ActionsButton
              submissionId={submission.id}
              testcases={submission.problem.testcases}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link href={`/submission/${submission.id}`}>
              <DropdownMenuItem>
                <Eye className="mr-1 h-4 w-4" />
                View
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <RejudgeButton id={submission.id} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
