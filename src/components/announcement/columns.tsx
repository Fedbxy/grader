"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Announcement } from "@/types/announcement";
import Link from "next/link";

import { DataTableColumnHeader } from "@/components/table/column-header";
import { LocalTime } from "../local-time";

export const columns: ColumnDef<Announcement>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const announcement = row.original;

      return (
        <Link href={`/announcement/${announcement.id}`} className="link">
          {announcement.title}
        </Link>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
    cell: ({ row }) => {
      const announcement = row.original;

      return <LocalTime date={announcement.updatedAt.toISOString()} />;
    },
  },
];
