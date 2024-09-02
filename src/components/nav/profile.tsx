"use client";

import Link from "next/link";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function Profile({ id }: { id: number }) {
    return (
        <Link href={`/user/${id}/profile`}>
            <DropdownMenuItem>
                Profile
            </DropdownMenuItem>
        </Link>
    );
}