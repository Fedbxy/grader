import { validateRequest } from "@/lib/auth";
import Image from "next/image";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { EditAccountForm } from "./form";

export async function AccountCard() {
    const { user } = await validateRequest();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Account</CardTitle>
                <CardDescription>Make changes to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-center">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={user!.avatar ? `/api/user/${user!.id}/avatar` : ""} alt={user!.username} />
                        <AvatarFallback>{user!.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
                <EditAccountForm user={user!} />
            </CardContent>
        </Card>
    );
}