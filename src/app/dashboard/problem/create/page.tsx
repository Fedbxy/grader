import Link from "next/link";
import { allowAccess } from "@/lib/auth";

import { ArrowLeft } from 'lucide-react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CreateProblemForm } from "./form";
import { Button } from "@/components/ui/button";
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
                <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/problem"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}