"use client";

import { signout } from "@/actions/auth";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

export function SignOut() {
    const { toast } = useToast();

    async function onClick() {
        const response = await signout();

        if (response?.error) {
            return toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: response.error,
            });
        }

        return toast({
            variant: "constructive",
            title: "Success!",
            description: "You have successfully signed out.",
        });
    }

    return (
        <DropdownMenuItem onClick={onClick}>
            Sign Out
        </DropdownMenuItem>
    );
}