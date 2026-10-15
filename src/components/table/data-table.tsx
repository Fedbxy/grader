"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTablePagination } from "@/components/table/pagination";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "../ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isPaginationSaved?: boolean;
  canSelectRowsPerPage?: boolean;
  // Columns to hide from the start, e.g. ones that only apply when signed in.
  columnVisibility?: VisibilityState;
  // Makes the whole row open this URL. It has to be a prop here because server
  // pages cannot hand functions to this client component; wrap DataTable in a
  // client component to pass one.
  rowHref?: (row: TData) => string;
}

// Links and controls inside a row keep their own click behaviour.
// Tooltip triggers are included so tapping an icon shows its tooltip instead of
// opening the row.
const INTERACTIVE = "a, button, input, [role=button], [data-slot=tooltip-trigger]";

export function DataTable<TData, TValue>({
  columns,
  data,
  isPaginationSaved = true,
  canSelectRowsPerPage = true,
  columnVisibility,
  rowHref,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // TanStack Table has no compiler-safe API: useReactTable() returns functions
  // the React Compiler cannot memoize, so it skips this component.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility,
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  useEffect(() => setMounted(true), []);

  function rowProps(original: TData) {
    if (!rowHref) return {};
    const href = rowHref(original);
    const ignore = (target: EventTarget) =>
      target instanceof Element && target.closest(INTERACTIVE) !== null;

    return {
      // group/row lets cells react to the row's hover and focus. Keyboards use
      // the row's link, so the row itself is not a tab stop.
      className:
        "group/row cursor-pointer has-[a:focus-visible]:bg-muted/50 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-ring",
      onClick: (e: React.MouseEvent) => {
        if (ignore(e.target)) return;
        // Dragging to select text ends in a click on the row.
        if (window.getSelection()?.toString()) return;
        if (e.ctrlKey || e.metaKey) {
          window.open(href, "_blank");
        } else {
          router.push(href, { scroll: false });
        }
      },
      // The click event does not fire for the middle button.
      onAuxClick: (e: React.MouseEvent) => {
        if (e.button !== 1 || ignore(e.target)) return;
        window.open(href, "_blank");
      },
    };
  }

  if (!mounted) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={(header.column.columnDef.meta as { headerClassName?: string } | undefined)?.headerClassName}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  {...rowProps(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={(cell.column.columnDef.meta as { cellClassName?: string } | undefined)?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="py-4">
        <DataTablePagination
          table={table}
          isPaginationSaved={isPaginationSaved}
          canSelectRowsPerPage={canSelectRowsPerPage}
        />
      </div>
    </div>
  );
}
