"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Problem } from "@/types/problem";
import Link from "next/link";

import { FileText, MoreHorizontal, Send, FileCheck2, Check, X } from "lucide-react";
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
import { AcceptedUsersDialog } from "./acceptedUsers";

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
                        <Button variant="outline" className={`h-8 w-8 p-0 ${isUserAccepted !== undefined ? (isUserAccepted ? "bg-constructive/15 text-constructive" : "bg-destructive/15 text-destructive") : ""}`}>
                            {isUserAccepted !== undefined ? (
                                isUserAccepted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />
                            ) : (
                                <MoreHorizontal className="h-4 w-4" />
                            )}
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <a href={`/api/problem/${problem.id}/statement`} target="_blank">
                            <DropdownMenuItem><FileText className="h-4 w-4 mr-1" />View</DropdownMenuItem>
                        </a>
                        <DropdownMenuSeparator />
                        <a href={`/submit/${problem.id}`} target="_blank">
                            <DropdownMenuItem><Send className="h-4 w-4 mr-1" />Submit</DropdownMenuItem>
                        </a>
                        {latestSubmissionId && (
                            <a href={`/submission/${latestSubmissionId}`} target="_blank">
                                <DropdownMenuItem><FileCheck2 className="h-4 w-4 mr-1" />Latest Submission</DropdownMenuItem>
                            </a>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];