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
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { IssuePriority, IssueStatus } from "@athens/api/schemas/Issues";

// Issue type - inferred from API
export type Issue = {
  id: string;
  issue_id: string | null;
  project_asset_id: string | null;
  system: string | null;
  priority: IssuePriority | null;
  short_description: string | null;
  description: string | null;
  status: IssueStatus | null;
  is_closed: number | null; // 0 or 1
  date_opened: string | null;
  timestamp_modified: string | null;
};

type IssuesTableProps = {
  data: Issue[];
  onRowClick: (issue: Issue) => void;
};

// Helper component for priority badges
function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return <span className="text-muted-foreground">—</span>;

  const p = priority.toUpperCase();
  let colorClass = "bg-muted text-muted-foreground";
  let label = priority;

  if (p === "H") {
    colorClass = "bg-highlight/10 text-highlight";
    label = "High";
  } else if (p === "M") {
    colorClass = "bg-warning/10 text-warning";
    label = "Medium";
  } else if (p === "L") {
    colorClass = "bg-muted text-muted-foreground";
    label = "Low";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}

// Helper component for status badges
function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  const s = status.toUpperCase();
  let colorClass = "bg-muted text-muted-foreground";

  if (s === "NEW") {
    colorClass = "bg-accent/10 text-accent";
  } else if (s === "ASSIGNED") {
    colorClass = "bg-info/10 text-info";
  } else if (s === "RESOLVED") {
    colorClass = "bg-warning/10 text-warning";
  } else if (s === "CLOSED") {
    colorClass = "bg-success/10 text-success";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
}

export function IssuesTable({ data, onRowClick }: IssuesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [hideClosedIssues, setHideClosedIssues] = useState(false);

  // Define columns
  const columns = useMemo<ColumnDef<Issue>[]>(
    () => [
      {
        accessorKey: "issue_id",
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
              ID
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
          <span className="font-mono text-sm font-medium">
            {row.getValue("issue_id") || "—"}
          </span>
        ),
      },
      {
        accessorKey: "date_opened",
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
              Date Opened
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
        cell: ({ row }) => {
          const dateStr = row.getValue("date_opened") as string | null;
          if (!dateStr) return <span className="text-muted-foreground">—</span>;
          try {
            const date = new Date(dateStr);
            return (
              <span className="font-mono text-sm tabular-nums">
                {date.toLocaleDateString()}
              </span>
            );
          } catch {
            return <span className="text-muted-foreground">—</span>;
          }
        },
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue(columnId) as string | null;
          const b = rowB.getValue(columnId) as string | null;
          if (!a && !b) return 0;
          if (!a) return 1;
          if (!b) return -1;
          return new Date(a).getTime() - new Date(b).getTime();
        },
      },
      {
        accessorKey: "short_description",
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
              Short Description
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
          <span className="max-w-md truncate">
            {row.getValue("short_description") || "—"}
          </span>
        ),
      },
      {
        accessorKey: "system",
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
          <span className="text-sm">{row.getValue("system") || "—"}</span>
        ),
      },
      {
        accessorKey: "priority",
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
              Priority
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
        cell: ({ row }) => <PriorityBadge priority={row.getValue("priority")} />,
        sortingFn: (rowA, rowB, columnId) => {
          const priorityOrder: Record<string, number> = { H: 3, M: 2, L: 1 };
          const a = (rowA.getValue(columnId) as string | null)?.toUpperCase() || "";
          const b = (rowB.getValue(columnId) as string | null)?.toUpperCase() || "";
          return (priorityOrder[a] || 0) - (priorityOrder[b] || 0);
        },
      },
      {
        accessorKey: "status",
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
              Status
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
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        sortingFn: (rowA, rowB, columnId) => {
          const statusOrder: Record<string, number> = {
            NEW: 1,
            ASSIGNED: 2,
            RESOLVED: 3,
            CLOSED: 4,
          };
          const a = (rowA.getValue(columnId) as string | null)?.toUpperCase() || "";
          const b = (rowB.getValue(columnId) as string | null)?.toUpperCase() || "";
          return (statusOrder[a] || 0) - (statusOrder[b] || 0);
        },
      },
      {
        accessorKey: "timestamp_modified",
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
              Updated
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
        cell: ({ row }) => {
          const dateStr = row.getValue("timestamp_modified") as string | null;
          if (!dateStr) return <span className="text-muted-foreground">—</span>;
          try {
            const date = new Date(dateStr);
            return (
              <span className="font-mono text-sm tabular-nums text-muted-foreground">
                {date.toLocaleDateString()}
              </span>
            );
          } catch {
            return <span className="text-muted-foreground">—</span>;
          }
        },
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue(columnId) as string | null;
          const b = rowB.getValue(columnId) as string | null;
          if (!a && !b) return 0;
          if (!a) return 1;
          if (!b) return -1;
          return new Date(a).getTime() - new Date(b).getTime();
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: (value) => setHideClosedIssues(value === "hideClosed"),
    state: {
      sorting,
      globalFilter: hideClosedIssues ? "hideClosed" : undefined,
    },
    filterFns: {
      hideClosed: (row) => {
        const status = row.original.status?.toUpperCase();
        const isClosed = row.original.is_closed === 1 || status === "CLOSED";
        return !isClosed;
      },
    },
  });

  const rows = table.getRowModel().rows;

  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No issues found for this project</p>
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
                <TableRow
                  key={row.id}
                  className="cursor-pointer transition-colors hover:bg-accent/5"
                  onClick={() => onRowClick(row.original)}
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
                  <span className="text-muted-foreground">
                    {hideClosedIssues
                      ? "All issues are closed"
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
          Showing {rows.length} of {data.length} issues
        </span>
      </div>
    </div>
  );
}

// Separate filter component for the header
export function IssuesFilter({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="hide-closed"
        checked={checked}
        onCheckedChange={(c) => onCheckedChange(c === true)}
      />
      <Label
        htmlFor="hide-closed"
        className="text-sm font-medium cursor-pointer select-none"
      >
        Hide closed issues
      </Label>
    </div>
  );
}
