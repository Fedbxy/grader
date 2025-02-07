import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { Path } from "@/components/path";
import { Button } from "@/components/ui/button";
import { NavigationTabs } from "../tabs";
import { DashboardCard } from "../card";

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
        <DashboardCard
            title="Problems"
            path="/dashboard/problem"
            columns={columns}
            data={data}
        />
    );
}