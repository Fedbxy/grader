"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/types";
import Link from "next/link";

import { MoreHorizontal, Eye, UserCog, UserX } from "lucide-react";
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

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
  },
  {
    accessorKey: "displayName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Display Name" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const formatted = role[0].toUpperCase() + role.slice(1);

      return formatted;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

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
            <Link href={`/dashboard/user/${user.id}`}>
              <DropdownMenuItem>
                <Eye className="mr-1 h-4 w-4" />
                View
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link href={`/dashboard/user/${user.id}/edit`}>
              <DropdownMenuItem>
                <UserCog className="mr-1 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </Link>
            <Link href={`/dashboard/user/${user.id}/delete`}>
              <DropdownMenuItem className="text-destructive">
                <UserX className="mr-1 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
