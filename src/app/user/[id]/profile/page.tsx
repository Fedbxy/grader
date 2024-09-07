import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BadgeCheck, Ban } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
    title: "User Profile",
};

export default async function Page({ params }: { params: { id: string } }) {
    if (isNaN(Number(params.id))) {
        notFound();
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(params.id) }
    })

    if (!user) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-lg md:max-w-xl">
                <CardHeader />
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={user.avatar ? `/api/user/${user.id}/avatar` : ""} alt={user.username} />
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center space-x-2">
                                {user.role === "admin" && <Badge><BadgeCheck className="h-4 w-4 mr-1" />{user.role}</Badge>}
                                {user.isBanned && <Badge variant="destructive"><Ban className="h-4 w-4 mr-1" />Banned</Badge>}
                            </div>
                            <p className="text-lg font-semibold">{user.displayName}</p>
                            <p className="text-sm text-muted-foreground">{user.username}</p>
                        </div>
                        <div className="bg-secondary p-4 rounded-md">
                            <pre className="text-sm text-ellipsis overflow-hidden">{user.bio ?? (<span className="text-muted-foreground">No bio</span>)}</pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}