import { validateRequest, allowAccess } from "@/lib/auth";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EditProfileForm } from "./form";

export default async function Page() {
    await allowAccess("user");
    const { user } = await validateRequest();

    return (
        <div className="flex justify-center mt-8">
            <Card className="w-full max-w-xs md:max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Settings</CardTitle>
                    <CardDescription>Edit your profile information.</CardDescription>
                </CardHeader>
                <CardContent>   
                    <EditProfileForm user={user!} />
                </CardContent>
            </Card>
        </div>
    );
}