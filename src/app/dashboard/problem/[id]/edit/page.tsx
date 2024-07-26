import Link from "next/link";
import { allowAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

import { ArrowLeft } from 'lucide-react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EditProblemForm } from "./form";
import { Button } from "@/components/ui/button";

export default async function Page({ params }: { params: { id: string } }) {
    await allowAccess("admin");

    if (isNaN(Number(params.id))) {
        notFound();
    }

    const problem = await prisma.problem.findUnique({
        where: { id: Number(params.id) },
        include: { author: true },
    })

    if (!problem) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-lg md:max-w-xl">
                <CardHeader>
                    <CardTitle>Edit Problem Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <EditProblemForm problem={problem} />
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/user"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}