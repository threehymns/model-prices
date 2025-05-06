import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  type ColumnDef,
  type SortingState,
  type Updater,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { ModelData } from "@/hooks/useModelData";

interface ModelSelectorProps {
  allModels: ModelData[];
  selectedModels: Set<string>;
  columns: ColumnDef<ModelData, any>[];
  toggleModelSelection: (modelName: string) => void;
  sorting: SortingState;
  setSorting: (updater: Updater<SortingState>) => void;
}

export function ModelSelector({
  allModels,
  columns,
  sorting,
  setSorting,
}: ModelSelectorProps) {
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable<ModelData>({
    data: allModels,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting: sorting ?? [],
      globalFilter,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const originalRow = row.original as { Name: string, Lab: string };
      return (
        originalRow.Name.toLowerCase().includes(search) ||
        originalRow.Lab.toLowerCase().includes(search)
      );
    },
  });

  return (
    <section className="mt-10 mx-auto max-w-5xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Select Models to Display</h2>
        <Input
          placeholder="Search models or labs..."
          value={globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="max-w-2xs"
        />
      </div>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'relative',
                        header.column.getCanSort() && 'cursor-pointer select-none hover:bg-accent/50 transition-colors',
                        header.column.getIsSorted() && 'bg-accent/25'
                      )}
                      onClick={header.column.getCanSort() ? () => header.column.toggleSorting() : undefined}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        {header.column.getCanSort() && (
                          <div className="w-4">
                            {header.column.getIsSorted() && (
                              header.column.getIsSorted() === 'asc' ? (
                                <ArrowUpIcon className="h-4 w-4" />
                              ) : (
                                <ArrowDownIcon className="h-4 w-4" />
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="odd:bg-background/20"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section >
  );
}