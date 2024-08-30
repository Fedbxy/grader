import { allowAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { Path } from "@/components/path";
import { Button } from "@/components/ui/button";

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

    return (
        <div className="container flex flex-col space-y-2 mx-auto py-10">
            <h1 className="text-2xl font-semibold">Problems</h1>
            <div className="flex justify-between items-center">
                <Path path="/dashboard/problem" />
                <Link href="/dashboard/problem/create">
                    <Button size="icon"><Plus /></Button>
                </Link>
            </div>
            <DataTable columns={columns} data={data} />
        </div>
    );
}