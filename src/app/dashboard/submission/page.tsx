import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";
import { submissionListSelect } from "@/lib/select";

import { columns } from "./columns";
import { DashboardCard } from "../card";

export default async function Page() {
  await allowAccess("admin");

  const data = await prisma.submission.findMany({
    orderBy: {
      id: "desc",
    },
    select: submissionListSelect,
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
