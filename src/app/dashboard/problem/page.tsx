import { allowAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";

export default async function Page() {
    await allowAccess("admin");

    const data = await prisma.problem.findMany({
        orderBy: {
            id: "asc",
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
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={problems} />
        </div>
    );
}