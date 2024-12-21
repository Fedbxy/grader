import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { Path } from "@/components/path";
import { Button } from "@/components/ui/button";
import { NavigationTabs } from "../tabs";

export default async function Page() {
    await allowAccess("admin");

    const data = await prisma.announcement.findMany({
        orderBy: {
            id: "asc",
        },
        include: {
            author: true,
        },
    });

    return (
        <div className="container flex flex-col space-y-2 mx-auto py-10">
            <NavigationTabs page="announcements" />
            <h1 className="text-2xl font-semibold">Announcements</h1>
            <div className="flex justify-between items-center">
                <Path path="/dashboard/announcement" />
                <Link href="/dashboard/announcement/create">
                    <Button size="icon"><Plus /></Button>
                </Link>
            </div>
            <DataTable columns={columns} data={data} />
        </div>
    );
}