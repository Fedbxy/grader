import { allowAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";

export default async function Page() {
    await allowAccess("admin");

    const data = await prisma.user.findMany({
        orderBy: {
            id: "asc",
        },
        select: {
            id: true,
            username: true,
            role: true,
            displayName: true,
            bio: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    );
}