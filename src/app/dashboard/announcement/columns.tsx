"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Announcement } from "@/types/announcement";
import { User } from "@/types/user";
import Link from "next/link";

import { MoreHorizontal, Eye, FolderCog, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { ToggleVisibility } from "./toggle-visibility";

export const columns: ColumnDef<Announcement>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
  },
  {
    accessorKey: "visibility",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visibility" />
    ),
    cell: ({ row }) => {
      const visibility = row.original.visibility;

      return visibility === "public" ? (
        "Public"
      ) : (
        <span className="text-muted-foreground">Private</span>
      );
    },
  },
  {
    accessorKey: "author",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Author" />
    ),
    cell: ({ row }) => {
      const author = row.getValue("author") as User;

      return (
        <Link href={`/dashboard/user/${author.id}`} className="link">
          {author.displayName}
        </Link>
      );
    },
  },
  {
    id: "actions",
    header: () => (
      <Link href="/dashboard/announcement/create">
        <Button className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Create announcement</span>
        </Button>
      </Link>
    ),
    cell: ({ row }) => {
      const announcement = row.original;

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
            <Link href={`/announcement/${announcement.id}`}>
              <DropdownMenuItem>
                <Eye className="mr-1 h-4 w-4" />
                View
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link href={`/dashboard/announcement/${announcement.id}/edit`}>
              <DropdownMenuItem>
                <FolderCog className="mr-1 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </Link>
            <ToggleVisibility
              id={announcement.id}
              visibility={announcement.visibility}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
