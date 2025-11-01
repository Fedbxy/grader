import prisma from "@/lib/prisma";
import { columns } from "@/components/submission/columns";

import { DataTable } from "@/components/table/data-table";

export async function Submission({ problemId }: { problemId: number }) {
  const data = await prisma.submission.findMany({
    where: {
      problemId: problemId,
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
