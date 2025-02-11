import prisma from "@/lib/prisma";

import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";

export async function Announcement() {
  const data = await prisma.announcement.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    where: {
        visibility: "public",
    },
    include: {
        author: true,
    },
  });

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto flex flex-col space-y-2 py-10">
      <h1 className="text-2xl font-semibold">Announcements</h1>
      <DataTable columns={columns} data={data} isPaginationSaved={false} canSelectRowsPerPage={false} />
    </div>
  );
}
