"use client";

import { useState } from "react";
import { getAcceptedUsers } from "@/actions/getAcceptedUsers";
import Link from "next/link";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type AcceptedUser = {
    id: number;
    displayName: string;
};

export function AcceptedUsersDialog({ accepted, problemId }: { accepted: number, problemId: number }) {
    const [title, setTitle] = useState<string | undefined>(undefined);
    const [acceptedUsers, setAcceptedUsers] = useState<AcceptedUser[] | undefined>(undefined);

    async function onClick() {
        const response = await getAcceptedUsers(problemId);

        if (response.error) {
            return toast.error(response.error);
        }

        setTitle(response.title);
        setAcceptedUsers(response.acceptedUsers);
    }

    return (
        <Dialog>
            <DialogTrigger
                className="hover:underline"
                onClick={onClick}
            >
                {accepted}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {title}
                    </DialogTitle>
                    <DialogDescription className="flex flex-col space-y-1">
                        <span>Accepted by:</span>
                        {acceptedUsers?.map((user) => (
                            <Link key={user.id} href={`/user/${user.id}/profile`} className="hover:underline text-foreground">
                                {user.displayName}
                            </Link>
                        ))}
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}