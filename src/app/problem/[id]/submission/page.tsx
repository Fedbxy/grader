import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getProblemData } from "@/utils/problem";

import { columns } from "@/components/submission/columns";
import { DataTable } from "@/components/table/data-table";

export default async function Page({ params }: { params: { id: string } }) {
  if (isNaN(Number(params.id))) {
    notFound();
  }

  const { problem } = await getProblemData(Number(params.id));

  const data = await prisma.submission.findMany({
    where: {
      problemId: problem.id,
    },
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

  return <DataTable columns={columns} data={data} />;
}
