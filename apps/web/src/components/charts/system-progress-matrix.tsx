"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

type SystemProgressData = {
  docVerification?: Array<{ system: string; progress: number }>;
  checklist?: Array<{ system: string; progress: number }>;
  sit?: Array<{ system: string; progress: number }>;
};

type SystemRow = {
  system: string;
  checklist: number | null;
  sit: number | null;
  docVerification: number | null;
  minProgress: number;
};

interface SystemProgressMatrixProps {
  data: SystemProgressData | null | undefined;
  hideHealthy?: boolean;
  onHideHealthyChange?: (value: boolean) => void;
}

// Color logic matching existing components
const getProgressColor = (progress: number | null) => {
  if (progress === null) return null;
  if (progress >= 90) return "bg-success";
  if (progress >= 70) return "bg-info";
  if (progress >= 50) return "bg-warning";
  return "bg-highlight";
};

const getProgressTextColor = (progress: number | null) => {
  if (progress === null) return null;
  if (progress >= 90) return "text-success";
  if (progress >= 70) return "text-info";
  if (progress >= 50) return "text-warning";
  return "text-highlight";
};

// Filter checkbox component for use in headers
interface SystemProgressFilterProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function SystemProgressFilter({ checked, onCheckedChange }: SystemProgressFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="hide-healthy"
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <label
        htmlFor="hide-healthy"
        className="text-sm font-medium cursor-pointer select-none"
      >
        Hide healthy systems (all ≥ 70%)
      </label>
    </div>
  );
}

// Progress cell component
function ProgressCell({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-muted-foreground/50">-</span>;
  }

  const percentage = Math.round(value);
  const colorClass = getProgressColor(value);
  const textColorClass = getProgressTextColor(value);

  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono text-sm font-semibold tabular-nums ${textColorClass}`}>
        {percentage}%
      </span>
      <div className="relative h-2 w-16 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function SystemProgressMatrix({ 
  data, 
  hideHealthy: externalHideHealthy,
  onHideHealthyChange 
}: SystemProgressMatrixProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalHideHealthy, setInternalHideHealthy] = useState(true);
  
  // Use external state if provided, otherwise use internal
  const hideHealthy = externalHideHealthy ?? internalHideHealthy;
  const setHideHealthy = onHideHealthyChange ?? setInternalHideHealthy;

  // Transform data into flat structure
  const tableData = useMemo(() => {
    if (!data) return [];

    // Get all unique systems
    const systemsMap = new Map<string, SystemRow>();

    // Process checklist data
    data.checklist?.forEach((item) => {
      if (!systemsMap.has(item.system)) {
        systemsMap.set(item.system, {
          system: item.system,
          checklist: null,
          sit: null,
          docVerification: null,
          minProgress: 100,
        });
      }
      const row = systemsMap.get(item.system)!;
      row.checklist = item.progress;
    });

    // Process SIT data
    data.sit?.forEach((item) => {
      if (!systemsMap.has(item.system)) {
        systemsMap.set(item.system, {
          system: item.system,
          checklist: null,
          sit: null,
          docVerification: null,
          minProgress: 100,
        });
      }
      const row = systemsMap.get(item.system)!;
      row.sit = item.progress;
    });

    // Process doc verification data
    data.docVerification?.forEach((item) => {
      if (!systemsMap.has(item.system)) {
        systemsMap.set(item.system, {
          system: item.system,
          checklist: null,
          sit: null,
          docVerification: null,
          minProgress: 100,
        });
      }
      const row = systemsMap.get(item.system)!;
      row.docVerification = item.progress;
    });

    // Calculate minProgress for filtering
    const rows = Array.from(systemsMap.values()).map((row) => {
      const values = [row.checklist, row.sit, row.docVerification].filter(
        (v): v is number => v !== null
      );
      row.minProgress = values.length > 0 ? Math.min(...values) : 100;
      return row;
    });

    return rows;
  }, [data]);

  // Define columns
  const columns = useMemo<ColumnDef<SystemRow>[]>(
    () => [
      {
        accessorKey: "system",
        id: "system",
        enableSorting: true,
        header: ({ column }) => {
          const sortDirection = column.getIsSorted();
          return (
            <button
              className="flex items-center gap-2 font-semibold hover:text-accent transition-colors"
              onClick={() => {
                if (sortDirection === "desc") {
                  column.clearSorting();
                } else {
                  column.toggleSorting(sortDirection === "asc");
                }
              }}
            >
              System
              {sortDirection === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : sortDirection === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("system")}</span>
        ),
      },
      {
        accessorKey: "checklist",
        enableSorting: true,
        header: ({ column }) => {
          const sortDirection = column.getIsSorted();
          return (
            <button
              className="flex items-center gap-2 font-semibold hover:text-accent transition-colors"
              onClick={() => {
                if (sortDirection === "desc") {
                  column.clearSorting();
                } else {
                  column.toggleSorting(sortDirection === "asc");
                }
              }}
            >
              Checklist
              {sortDirection === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : sortDirection === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        cell: ({ row }) => <ProgressCell value={row.getValue("checklist")} />,
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue(columnId) as number | null;
          const b = rowB.getValue(columnId) as number | null;
          if (a === null && b === null) return 0;
          if (a === null) return 1;
          if (b === null) return -1;
          return a - b;
        },
      },
      {
        accessorKey: "sit",
        enableSorting: true,
        header: ({ column }) => {
          const sortDirection = column.getIsSorted();
          return (
            <button
              className="flex items-center gap-2 font-semibold hover:text-accent transition-colors"
              onClick={() => {
                if (sortDirection === "desc") {
                  column.clearSorting();
                } else {
                  column.toggleSorting(sortDirection === "asc");
                }
              }}
            >
              SIT
              {sortDirection === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : sortDirection === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        cell: ({ row }) => <ProgressCell value={row.getValue("sit")} />,
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue(columnId) as number | null;
          const b = rowB.getValue(columnId) as number | null;
          if (a === null && b === null) return 0;
          if (a === null) return 1;
          if (b === null) return -1;
          return a - b;
        },
      },
      {
        accessorKey: "docVerification",
        enableSorting: true,
        header: ({ column }) => {
          const sortDirection = column.getIsSorted();
          return (
            <button
              className="flex items-center gap-2 font-semibold hover:text-accent transition-colors"
              onClick={() => {
                if (sortDirection === "desc") {
                  column.clearSorting();
                } else {
                  column.toggleSorting(sortDirection === "asc");
                }
              }}
            >
              Doc Verification
              {sortDirection === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : sortDirection === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        cell: ({ row }) => <ProgressCell value={row.getValue("docVerification")} />,
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue(columnId) as number | null;
          const b = rowB.getValue(columnId) as number | null;
          if (a === null && b === null) return 0;
          if (a === null) return 1;
          if (b === null) return -1;
          return a - b;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      globalFilter: hideHealthy ? "hideHealthy" : "",
    },
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue !== "hideHealthy") return true;
      // Hide if all non-null values are >= 70
      const values = [
        row.original.checklist,
        row.original.sit,
        row.original.docVerification,
      ].filter((v): v is number => v !== null);
      
      if (values.length === 0) return true;
      return values.some((v) => v < 70);
    },
  });

  // Use TanStack Table's row model which automatically applies filtering then sorting
  const rows = table.getRowModel().rows;

  if (!data || tableData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No system progress data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
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
                  <span className="text-muted-foreground">
                    {hideHealthy
                      ? "All systems are healthy (≥ 70%)"
                      : "No results."}
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Row Counter - Bottom Right */}
      <div className="flex justify-end">
        <span className="text-sm text-muted-foreground font-mono tabular-nums">
          Showing {rows.length} of {tableData.length} systems
        </span>
      </div>
    </div>
  );
}
