import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getProblemData } from "@/utils/problem";
import { submissionListSelect } from "@/lib/select";
import { visibleSubmissionsWhere } from "@/utils/submission";

import { columns } from "@/components/submission/columns";
import { DataTable } from "@/components/table/data-table";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (isNaN(Number(params.id))) {
    notFound();
  }

  const { problem, user } = await getProblemData(Number(params.id));

  const data = await prisma.submission.findMany({
    where: {
      problemId: problem.id,
      ...visibleSubmissionsWhere(user),
    },
    orderBy: {
      id: "desc",
    },
    select: submissionListSelect,
  });

  return <DataTable columns={columns} data={data} />;
}
