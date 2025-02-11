import { ColumnDef } from "@tanstack/react-table";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Path path={path} />
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}
