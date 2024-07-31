import prisma from "@/lib/prisma";

import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";

export default async function Page() {
    const data = await prisma.problem.findMany({
        orderBy: {
            id: "asc",
        },
        where: {
            visibility: "public",
        },
        include: {
            author: true,
        },
    });

    const problems = data.map((problem) => {
        return {
            ...problem,
            statement: null,
        };
    });

    return (
        <div className="container flex flex-col space-y-2 mx-auto py-10">
            <h1 className="text-2xl font-semibold">Problems</h1>
            <h2 className="text-sm text-muted-foreground">Select a problem to view its statement and submit a solution.</h2>
            <DataTable columns={columns} data={problems} />
        </div>
    );
}