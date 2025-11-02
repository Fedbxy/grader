import { ColumnDef } from "@tanstack/react-table";

import { Path } from "@/components/path";
import { DataTable } from "@/components/table/data-table";

export function DashboardCard<TData, TValue>({
  title,
  path,
  columns,
  data,
}: {
  title: string;
  path: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}) {
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Path path={path} />
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
