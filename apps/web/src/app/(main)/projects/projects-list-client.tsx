"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	getPaginationRowModel,
	flexRender,
	type ColumnDef,
	type SortingState,
	type ColumnFiltersState,
} from "@tanstack/react-table";
import { orpc } from "@/utils/orpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CompletionBadge } from "@/components/completion-badge";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type ProjectAssetItem = {
	id: string | null;
	project_id: string | null;
	asset_id: string | null;
	raptor_checklist_completion: number | null;
	sit_completion: number | null;
	doc_verification_completion: number | null;
	checklist_remaining: number | null;
	checklist_closed: number | null;
	checklist_non_conforming: number | null;
	checklist_not_applicable: number | null;
	checklist_deferred: number | null;
	projectName?: string | null;
	projectRegion?: string | null;
	projectPhase?: string | null;
	projectStatus?: string | null;
	projectOverallCompletion?: number | null;
	assetName?: string | null;
	assetType?: string | null;
	assetLocation?: string | null;
};

export function ProjectsListClient() {
	const router = useRouter();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");

	// Fetch all data from server - let TanStack Table handle filtering client-side
	const { data, isLoading } = useQuery(
		orpc.projectAssets.listDetailed.queryOptions({
			input: {
				limit: 1000, // Fetch a reasonable amount for client-side filtering
				offset: 0,
			},
		})
	);

	const columns: ColumnDef<ProjectAssetItem>[] = useMemo(
		() => [
			{
				accessorKey: "projectName",
				id: "projectName",
				header: ({ column }) => {
					const isSorted = column.getIsSorted();
					return (
						<Button
							variant="ghost"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
							className="-ml-4"
						>
							Project
							{isSorted === "asc" ? (
								<ArrowUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ArrowDown className="ml-2 h-4 w-2" />
							) : (
								<ArrowUpDown className="ml-2 h-4 w-4" />
							)}
						</Button>
					);
				},
				cell: ({ row }) => (
					<div className="font-medium">
						{row.original.projectName || "Unknown Project"}
					</div>
				),
				enableGlobalFilter: true, // Include in global search
			},
			{
				accessorKey: "assetName",
				id: "assetName",
				header: ({ column }) => {
					const isSorted = column.getIsSorted();
					return (
						<Button
							variant="ghost"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
							className="-ml-4"
						>
							Rig
							{isSorted === "asc" ? (
								<ArrowUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ArrowDown className="ml-2 h-4 w-2" />
							) : (
								<ArrowUpDown className="ml-2 h-4 w-4" />
							)}
						</Button>
					);
				},
				cell: ({ row }) => (
					<div>{row.original.assetName || "Unknown Rig"}</div>
				),
				enableGlobalFilter: true, // Include in global search
			},
			{
				accessorKey: "assetType",
				id: "assetType",
				header: "Type",
				cell: ({ row }) => (
					<div className="text-muted-foreground">
						{row.original.assetType || "—"}
					</div>
				),
				enableColumnFilter: true,
				filterFn: "equalsString",
			},
			// Hidden columns for filtering only
			{
				accessorKey: "projectPhase",
				id: "projectPhase",
				enableColumnFilter: true,
				filterFn: "equalsString",
			},
			{
				accessorKey: "projectStatus",
				id: "projectStatus",
				enableColumnFilter: true,
				filterFn: "equalsString",
			},
			{
				accessorKey: "raptor",
				id: "raptor",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="-ml-4"
					>
						RAPTOR
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => (
					<CompletionBadge value={row.original.raptor_checklist_completion} />
				),
			},
			{
				accessorKey: "sit_completion",
				id: "sit",
				header: ({ column }) => {
					const isSorted = column.getIsSorted();
					return (
						<Button
							variant="ghost"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
							className="-ml-4"
						>
							SIT
							{isSorted === "asc" ? (
								<ArrowUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ArrowDown className="ml-2 h-4 w-2" />
							) : (
								<ArrowUpDown className="ml-2 h-4 w-4" />
							)}
						</Button>
					);
				},
				cell: ({ row }) => (
					<CompletionBadge value={row.original.sit_completion} />
				),
			},
			{
				accessorKey: "doc_verification_completion",
				id: "doc",
				header: ({ column }) => {
					const isSorted = column.getIsSorted();
					return (
						<Button
							variant="ghost"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
							className="-ml-4"
						>
							Doc
							{isSorted === "asc" ? (
								<ArrowUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ArrowDown className="ml-2 h-4 w-2" />
							) : (
								<ArrowUpDown className="ml-2 h-4 w-4" />
							)}
						</Button>
					);
				},
				cell: ({ row }) => (
					<CompletionBadge value={row.original.doc_verification_completion} />
				),
			},
			{
				accessorKey: "checklist_remaining",
				id: "remaining",
				header: ({ column }) => {
					const isSorted = column.getIsSorted();
					return (
						<Button
							variant="ghost"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
							className="-ml-4"
						>
							Remaining
							{isSorted === "asc" ? (
								<ArrowUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ArrowDown className="ml-2 h-4 w-2" />
							) : (
								<ArrowUpDown className="ml-2 h-4 w-4" />
							)}
						</Button>
					);
				},
				cell: ({ row }) => (
					<div className="text-center">
						{row.original.checklist_remaining ?? 0}
					</div>
				),
			},
		],
		[]
	);

	const table = useReactTable({
		data: data?.data ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(), // Enable client-side filtering
		getSortedRowModel: getSortedRowModel(), // Enable client-side sorting
		getPaginationRowModel: getPaginationRowModel(), // Enable client-side pagination
		state: {
			sorting,
			columnFilters,
			globalFilter,
			columnVisibility: {
				projectPhase: false, // Hide filter-only columns
				projectStatus: false,
			},
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: "includesString", // Use case-insensitive string matching for global filter
		initialState: {
			pagination: {
				pageSize: 20,
			},
		},
	});

	const handleRowClick = (row: ProjectAssetItem) => {
		if (row.project_id) {
			router.push(`/projects/${row.project_id}`);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex gap-4">
					<Skeleton className="h-10 flex-1" />
					<Skeleton className="h-10 w-40" />
					<Skeleton className="h-10 w-40" />
					<Skeleton className="h-10 w-40" />
				</div>
				<div className="space-y-2">
					{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
						<Skeleton key={i} className="h-16 w-full" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-col gap-4 sm:flex-row">
				<Input
					placeholder="Search projects and rigs..."
					value={globalFilter ?? ""}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="flex-1"
				/>
				<Select
					value={
						(table.getColumn("projectPhase")?.getFilterValue() as string) ?? "all"
					}
					onValueChange={(value) =>
						table.getColumn("projectPhase")?.setFilterValue(value === "all" ? undefined : value)
					}
				>
					<SelectTrigger className="w-full sm:w-40">
						<SelectValue placeholder="Phase" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Phases</SelectItem>
						<SelectItem value="Planning">Planning</SelectItem>
						<SelectItem value="Design">Design</SelectItem>
						<SelectItem value="Construction">Construction</SelectItem>
						<SelectItem value="Commissioning">Commissioning</SelectItem>
						<SelectItem value="Operations">Operations</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={
						(table.getColumn("projectStatus")?.getFilterValue() as string) ?? "all"
					}
					onValueChange={(value) =>
						table.getColumn("projectStatus")?.setFilterValue(value === "all" ? undefined : value)
					}
				>
					<SelectTrigger className="w-full sm:w-40">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="Active">Active</SelectItem>
						<SelectItem value="On Hold">On Hold</SelectItem>
						<SelectItem value="Completed">Completed</SelectItem>
						<SelectItem value="Cancelled">Cancelled</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={
						(table.getColumn("assetType")?.getFilterValue() as string) ?? "all"
					}
					onValueChange={(value) =>
						table.getColumn("assetType")?.setFilterValue(value === "all" ? undefined : value)
					}
				>
					<SelectTrigger className="w-full sm:w-40">
						<SelectValue placeholder="Rig Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						<SelectItem value="Drilling">Drilling</SelectItem>
						<SelectItem value="Production">Production</SelectItem>
						<SelectItem value="Workover">Workover</SelectItem>
						<SelectItem value="Jack-up">Jack-up</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id} className="border-b bg-muted/50">
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											className="px-4 py-3 text-left text-sm font-medium"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody>
							{table.getRowModel().rows.length === 0 ? (
								<tr>
									<td
										colSpan={columns.length}
										className="py-12 text-center text-muted-foreground"
									>
										No projects found
									</td>
								</tr>
							) : (
								table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										onClick={() => handleRowClick(row.original)}
										className="cursor-pointer border-b transition-colors hover:bg-muted/50"
									>
										{row.getVisibleCells().map((cell) => (
											<td key={cell.id} className="px-4 py-3 text-sm">
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</td>
										))}
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
					{Math.min(
						(table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
						table.getFilteredRowModel().rows.length
					)}{" "}
					of {table.getFilteredRowModel().rows.length} results
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeft className="h-4 w-4" />
						Previous
					</Button>
					<div className="text-sm">
						Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

