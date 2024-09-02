import { allowAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { Path } from "@/components/path";

export default async function Page() {
    await allowAccess("admin");

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
            <Path path="/dashboard/submission" />
            <DataTable columns={columns} data={data} />
        </div>
    );
}