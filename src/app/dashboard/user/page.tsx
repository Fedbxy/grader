import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";

import { columns } from "./columns";
import { DashboardCard } from "../card";

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
      isBanned: true,
      displayName: true,
      bio: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <DashboardCard
      title="Users"
      path="/dashboard/user"
      columns={columns}
      data={data}
    />
  );
}
