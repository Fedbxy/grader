"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Problem } from "@/types/problem";
import Link from "next/link";

import { FileText, MoreHorizontal, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/table/column-header";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProblemWithAccepted = Problem & {
    accepted: number;
    isUserAccepted?: boolean;
    latestSubmissionId?: number;
};

export const columns: ColumnDef<ProblemWithAccepted>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="#" />
        ),
        cell: ({ row }) => {
            const id = row.original.id;
            const isUserAccepted = row.original.isUserAccepted;
            const latestSubmissionId = row.original.latestSubmissionId;

            let formatted = <span>{id}</span>;
            if (isUserAccepted !== undefined) {
                formatted = (
                    <Link href={`/submission/${latestSubmissionId}`}>
                        <span className={`hover:underline font-bold ${isUserAccepted ? "text-constructive" : "text-destructive"}`}>{id}</span>
                    </Link>
                );
            }

            return formatted;
        }
    },
    {
        accessorKey: "title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" />
        ),
    },
    {
        id: "limits",
        header: "Limits",
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
        accessorKey: "author",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Author" />
        ),
        cell: ({ row }) => {
            const author = row.original.author;

            return (
                <Link href={`/user/${author.id}/profile`} className="hover:underline">
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
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const problem = row.original;

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
                        <a href={`/api/problem/${problem.id}/statement`} target="_blank">
                            <DropdownMenuItem><FileText className="h-4 w-4 mr-1" />View</DropdownMenuItem>
                        </a>
                        <DropdownMenuSeparator />
                        <Link href={`/submit/${problem.id}`}>
                            <DropdownMenuItem><Send className="h-4 w-4 mr-1" />Submit</DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];