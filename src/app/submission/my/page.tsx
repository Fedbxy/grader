import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { columns } from "@/components/submission/columns";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Submission",
};

export default async function Page() {
    const { user } = await validateRequest();
    if (!user) {
        return redirect("/submission");
    }

    const data = await prisma.submission.findMany({
        where: {
            userId: user.id
        },
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
                <h1 className="text-2xl font-semibold">{`${user.displayName}'s`} submissions</h1>
                <Link href="/submission">
                    <Button variant="outline" size="sm">
                        View All Submissions
                    </Button>
                </Link>
            </div>
            <h2 className="text-sm text-muted-foreground">Select a submission to view more details</h2>
            <DataTable columns={columns} data={data} />
        </div>
    );
}