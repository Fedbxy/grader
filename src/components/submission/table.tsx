"use client";

import { VisibilityState } from "@tanstack/react-table";
import { SubmissionRow } from "@/types/submission";

import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";

// Server pages cannot pass the rowHref function across the client boundary, so
// they render this instead of DataTable.
export function SubmissionTable({
  data,
  columnVisibility,
}: {
  data: SubmissionRow[];
  columnVisibility?: VisibilityState;
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      columnVisibility={columnVisibility}
      rowHref={(submission) => `/submission/${submission.id}`}
    />
  );
}
