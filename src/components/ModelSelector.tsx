import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpIcon, ArrowDownIcon, ReloadIcon } from "@radix-ui/react-icons";
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
import { useStore } from "@nanostores/react";
import {
  modelStore,
  toggleModelSelection,
  setSorting,
  selectAllModels,
  deselectAllModels,
  setAllModels,
  setSelectedModels,
} from "../stores/modelStore";
import {
  calculateCombinedPrice,
  getFullLabName,
  getOpenRouterLabSlug,
} from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "./ui/button";
import { Filter, X } from "lucide-react";

interface ModelSelectorProps {
  allModels: ModelData[];
  initialSelectedModels: string[];
}

export function ModelSelector({
  allModels,
  initialSelectedModels,
}: ModelSelectorProps) {
  const { selectedModels, sorting, activePriceTab } = useStore(modelStore);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [storeInitialized, setStoreInitialized] = React.useState(false);

  // Initialize the store with initialSelectedModels on first render
  React.useEffect(() => {
    if (!storeInitialized) {
      // Initialize allModels in the store first
      setAllModels(allModels);
      
      // Initialize selected models from initialSelectedModels
      if (initialSelectedModels.length > 0) {
        setSelectedModels(new Set(initialSelectedModels));
      } else {
        // Make sure we have an empty set rather than undefined
        setSelectedModels(new Set());
      }
      
      // Mark the store as initialized
      setStoreInitialized(true);
    }
  }, []);


  // Helper function to determine selection state
  const isModelSelected = React.useCallback(
    (modelName?: string) => {
      if (activePriceTab === "none") {
        // User has explicitly chosen to have nothing selected
        return false;
      }
      
      // Check the actual store values
      if (modelName) {
        return selectedModels.has(modelName);
      } else {
        return selectedModels.size === allModels.length;
      }
    },
    [selectedModels, allModels.length, activePriceTab]
  );

  const inputColor = "#818cf8";
  const outputColor = "#22d3ee";

  const columns: ColumnDef<ModelData>[] = [
    {
      id: "select",
      header: () => {
        // For the header checkbox, check if all models are selected
        // Before hydration, use initialSelectedModels; after hydration, use the store
        const allSelected = !storeInitialized
          ? initialSelectedModels.length === allModels.length
          : selectedModels.size === allModels.length;

        return (
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={() => {
              if (allSelected) {
                deselectAllModels();
              } else {
                selectAllModels();
              }
            }}
            aria-label="Select all models"
          />
        );
      },
      cell: ({ row }) => {
        const modelName = row.original.Name;
        
        // Before hydration, check initialSelectedModels; after hydration, check the store
        const isSelected = !storeInitialized
          ? initialSelectedModels.includes(modelName)
          : selectedModels.has(modelName);

        return (
          <Checkbox
            id={modelName}
            checked={isSelected}
            onCheckedChange={() => {
              toggleModelSelection(modelName);
            }}
            aria-label={`Select ${modelName}`}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "Name",
      header: "Name",
      cell: ({ row }) => {
        const slug = row.original.Slug;
        const labSlug = getOpenRouterLabSlug(row.original.Lab);
        const openRouterLink = slug
          ? `https://openrouter.ai/${labSlug}/${slug}`
          : "#";
        return (
          <a
            href={openRouterLink}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer select-none font-medium hover:underline"
          >
            {row.original.Name}
          </a>
        );
      },
    },
    {
      accessorKey: "Combined",
      header: "Combined",
      cell: ({ row }) => (
        <span className="font-medium text-amber-200">
          {row.original.formattedCombinedPrice}
        </span>
      ),
      sortDescFirst: false,
      sortingFn: (rowA, rowB) => {
        const priceA = rowA.original.combinedPrice || 0;
        const priceB = rowB.original.combinedPrice || 0;
        return priceA - priceB;
      },
    },
    {
      accessorKey: "Input",
      header: "Input",
      cell: ({ row }) => (
        <span style={{ color: inputColor }}>{row.original.Input}</span>
      ),
      sortingFn: (rowA, rowB) => {
        const priceA = rowA.original.inputPrice || 0;
        const priceB = rowB.original.inputPrice || 0;
        return priceA - priceB;
      },
    },
    {
      accessorKey: "Output",
      header: "Output",
      cell: ({ row }) => (
        <span style={{ color: outputColor }}>{row.original.Output}</span>
      ),
      sortingFn: (rowA, rowB) => {
        const priceA = rowA.original.outputPrice || 0;
        const priceB = rowB.original.outputPrice || 0;
        return priceA - priceB;
      },
    },
    {
      accessorKey: "Lab",
      header: "Lab",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.labFullName}
        </span>
      ),
    },
    {
      accessorKey: "releaseDate",
      header: "Release Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.formattedReleaseDate}
        </span>
      ),
    },
    {
      accessorKey: "Artificial Analysis Intelligence Index",
      header: "Intelligence",
      cell: ({ row }) => {
        const index = row.original.intelligence;
        return (
          <span className="font-medium text-blue-400">{index || "-"}</span>
        );
      },
      sortDescFirst: true,
      sortingFn: (rowA, rowB) => {
        const indexA = rowA.original.intelligence || 0;
        const indexB = rowB.original.intelligence || 0;
        return indexA - indexB;
      },
    },
    {
      accessorKey: "Value",
      header: "Value",
      cell: ({ row }) => {
        return (
          <span className="font-medium text-green-300">
            {row.original.formattedValue}
          </span>
        );
      },
      sortDescFirst: true,
      sortingFn: (rowA, rowB) => {
        const valueA = rowA.original.value || 0;
        const valueB = rowB.original.value || 0;
        return valueA - valueB;
      },
    },
  ];

  const table = useReactTable<ModelData>({
    data: allModels, // Use the prop data for the table
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
      const originalRow = row.original as { Name: string; Lab: string };
      return (
        originalRow.Name.toLowerCase().includes(search) ||
        originalRow.Lab.toLowerCase().includes(search)
      );
    },
    meta: {
      selectedModels, // Pass this to ensure re-renders on selection changes
    },
  });

  const memoizedTableBody = React.useMemo(() => {
    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => (
          <TableRow
            key={`${row.id}-${(!storeInitialized ? initialSelectedModels.includes(row.original.Name) : selectedModels.has(row.original.Name)) ? 'selected' : 'unselected'}`}
            className={`odd:bg-background/20 ${(!storeInitialized ? initialSelectedModels.includes(row.original.Name) : selectedModels.has(row.original.Name)) ? '' : 'opacity-50'}`}
          >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ));
    } else {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      );
    }
  }, [table.getRowModel().rows, columns.length, selectedModels.size, initialSelectedModels, storeInitialized]);

  // Calculate total and selected model counts
  const totalModels = allModels.length;
  const selectedCount = !storeInitialized
    ? initialSelectedModels.length // Before hydration, use initialSelectedModels
    : (activePriceTab === "none" ? 0 : selectedModels.size); // After hydration, use the store

  return (
    <section className="mt-10 mx-auto max-w-5xl">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Model Selection
            </h2>
            <p className="text-sm text-muted-foreground">
              Select models to compare pricing and capabilities
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground md:text-end">
              <span className="font-medium">{selectedCount}</span> of{" "}
              <span className="font-medium">{totalModels}</span> models selected
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="Search models or labs..."
                  value={globalFilter ?? ""}
                  onChange={(event) =>
                    table.setGlobalFilter(event.target.value)
                  }
                  className="px-8"
                  aria-label="Search models"
                />
                <Filter className="absolute start-2 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                {globalFilter && (
                  <button
                    onClick={() => table.setGlobalFilter("")}
                    className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedModels(initialSelectedModels);
                  modelStore.set({
                    ...modelStore.get(),
                    displayMode: "both",
                  });
                }}
                aria-label="Reset to initial selection"
              >
                <ReloadIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
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
                        "relative",
                        header.column.getCanSort() &&
                          "cursor-pointer select-none hover:bg-accent/50 transition-colors",
                        header.column.getIsSorted() && "bg-accent/25",
                      )}
                      onClick={
                        header.column.getCanSort()
                          ? () => header.column.toggleSorting()
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {header.column.getCanSort() && (
                          <div className="w-4">
                            {header.column.getIsSorted() &&
                              (header.column.getIsSorted() === "asc" ? (
                                <ArrowUpIcon className="h-4 w-4" />
                              ) : (
                                <ArrowDownIcon className="h-4 w-4" />
                              ))}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>{memoizedTableBody}</TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}
