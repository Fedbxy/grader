import { allowAccess } from "@/lib/auth";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CreateProblemForm } from "./form";
import { Path } from "@/components/path";

export default async function Page() {
    await allowAccess("admin");

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-lg md:max-w-xl">
                <CardHeader>
                    <CardTitle>Create a Problem</CardTitle>
                    <Path path="/dashboard/problem/create" />
                </CardHeader>
                <CardContent>
                    <CreateProblemForm />
                </CardContent>
            </Card>
        </div>
    );
}