import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";

import { columns } from "./columns";
import { DashboardCard } from "../card";

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
        },
      },
      user: true,
    },
  });

  return (
    <DashboardCard
      title="Submissions"
      path="/dashboard/submission"
      columns={columns}
      data={data}
    />
  );
}
