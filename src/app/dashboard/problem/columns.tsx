"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Problem } from "@/types/problem";
import { User } from "@/types/user";
import Link from "next/link";

import { MoreHorizontal, Eye, FolderCog, RefreshCcw, Plus } from "lucide-react";
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

export const columns: ColumnDef<Problem>[] = [
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

            return visibility === "public" ? "Public" : <span className="text-muted-foreground">Private</span>;
        },
    },
    {
        accessorKey: "limits",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Limits" />
        ),
        cell: ({ row }) => {
            const time = row.original.timeLimit;
            const memory = row.original.memoryLimit;
            const formatted = `${time}ms | ${memory}MB`;

            return formatted;
        },
    },
    {
        accessorKey: "score",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Score" />
        ),
    },
    {
        accessorKey: "testcases",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Testcases" />
        ),
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
        }
    },
    {
        id: "actions",
        header: () => (
            <Link href="/dashboard/problem/create">
                <Button className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Create problem</span>
                </Button>
            </Link>
        ),
        cell: ({ row }) => {
            const problem = row.original;

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
                        <Link href={`/dashboard/problem/${problem.id}`}>
                            <DropdownMenuItem><Eye className="h-4 w-4 mr-1" />View</DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <Link href={`/dashboard/problem/${problem.id}/edit`}>
                            <DropdownMenuItem><FolderCog className="h-4 w-4 mr-1" />Edit</DropdownMenuItem>
                        </Link>
                        <Link href={`/dashboard/problem/${problem.id}/rejudge`}>
                            <DropdownMenuItem><RefreshCcw className="h-4 w-4 mr-1" />Rejudge</DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];