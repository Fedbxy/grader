import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  isPaginationSaved: boolean;
  canSelectRowsPerPage: boolean;
}

export function DataTablePagination<TData>({
  table,
  isPaginationSaved,
  canSelectRowsPerPage,
}: DataTablePaginationProps<TData>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageSizes = [10, 20, 50, 100];

  const [page, setPage] = useState(() => {
    if (!isPaginationSaved) {
      return 1;
    }

    const pageParam = searchParams.get("page");
    return pageParam && !isNaN(Number(pageParam))
      ? Math.round(Number(pageParam))
      : 1;
  });

  const [pageSize, setPageSize] = useState(() => {
    if (!isPaginationSaved) {
      return 10;
    }

    const pageSizeParam = searchParams.get("pageSize");
    const size =
      pageSizeParam && !isNaN(Number(pageSizeParam))
        ? Math.round(Number(pageSizeParam))
        : 10;
    return pageSizes.includes(size) ? size : 10;
  });

  useEffect(() => {
    const pageCount = Math.ceil(table.getRowCount() / pageSize);
    const pageValid = Math.max(1, Math.min(page, pageCount));

    if (page !== pageValid) {
      setPage(pageValid);
    }

    table.setPageSize(pageSize);
    table.setPageIndex(page - 1);

    if (!isPaginationSaved) {
      return;
    }

    window.history.replaceState(
      {},
      "",
      `${pathname}?page=${page}&pageSize=${pageSize}`,
    );
  }, [table, pathname, page, pageSize, isPaginationSaved]);

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {/* {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected. */}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        {canSelectRowsPerPage && table.getRowCount() > 10 && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizes.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {Math.ceil(table.getRowCount() / pageSize) > 1 && (
          <>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPage(1)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page - 1)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page + 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPage(table.getPageCount())}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
