import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";

import { columns } from "./columns";
import { DashboardCard } from "../card";

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
        <DashboardCard
            title="Announcements"
            path="/dashboard/announcement"
            columns={columns}
            data={data}
        />
    );
}