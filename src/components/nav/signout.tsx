"use client";

import { signout } from "@/actions/auth";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function SignOut() {
    async function onClick() {
        const response = await signout();

        if (response?.error) {
            return toast.error(response.error);
        }

        return toast.success("You have successfully signed out.");
    }

    return (
        <DropdownMenuItem onClick={onClick}>
            Sign Out
        </DropdownMenuItem>
    );
}