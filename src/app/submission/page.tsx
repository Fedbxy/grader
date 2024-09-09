import { Metadata } from "next";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { validateRequest } from "@/lib/auth";

import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Submission",
};

export default async function Page() {
    const { user } = await validateRequest();

    const data = await prisma.submission.findMany({
        orderBy: {
            id: "desc",
        },
        include: {
            problem: {
                include: {
                    author: true,
                }
            },
            user: true,
        },
    });

    return (
        <div className="container flex flex-col space-y-2 mx-auto py-10">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">All Submissions</h1>
                {user && (
                    <Link href="/submission/my">
                        <Button variant="outline" size="sm">
                            View My Submissions
                        </Button>
                    </Link>
                )}
            </div>
            <h2 className="text-sm text-muted-foreground">Select a submission to view more details</h2>
            <DataTable columns={columns} data={data} />
        </div>
    );
}