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

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    );
}