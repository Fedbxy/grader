"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function Profile({ id }: { id: number }) {
    const pathname = usePathname();

    return (
        <Link href={`/user/${id}/profile?back=${pathname}`}>
            <DropdownMenuItem>
                Profile
            </DropdownMenuItem>
        </Link>
    );
}