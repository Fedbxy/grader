import { validateRequest } from "@/lib/auth";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EditAccountForm } from "./form";

export async function AccountCard() {
    const { user } = await validateRequest();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Account</CardTitle>
                <CardDescription>Make changes to your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <EditAccountForm user={user!} />
            </CardContent>
        </Card>
    );
}