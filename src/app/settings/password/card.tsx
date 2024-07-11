import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChangePasswordForm } from "./form";

export async function PasswordCard() {

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Password</CardTitle>
                <CardDescription>Change your password. All sessions w
                    ill be logged out after saving.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChangePasswordForm />
            </CardContent>
        </Card>
    );
}