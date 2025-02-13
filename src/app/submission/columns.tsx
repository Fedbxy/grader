"use client";

import { columns as mainColumns } from "@/components/submission/columns";
import { ColumnDef } from "@tanstack/react-table";
import { Submission } from "@/types/submission";
import Link from "next/link";

import { ActionsButton } from "@/components/submission/actions-button";

export const columns: ColumnDef<Submission>[] = [
  ...mainColumns,
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