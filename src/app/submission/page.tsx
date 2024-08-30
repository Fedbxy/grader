import { Metadata } from "next";
import prisma from "@/lib/prisma";

import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";

export const metadata: Metadata = {
    title: "Submission",
};

export default async function Page() {
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
            <h1 className="text-2xl font-semibold">Submissions</h1>
            <h2 className="text-sm text-muted-foreground">Select a submission to view more details</h2>
            <DataTable columns={columns} data={data} />
        </div>
    );
}