"use client";

import { useState, useMemo, useEffect } from "react";
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
import { projectAssetDetailedItemSchema } from "@athens/api/routers/projectAssets";
import { z } from "zod";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, LayoutGrid, List } from "lucide-react";

type ProjectAssetItem = z.infer<typeof projectAssetDetailedItemSchema>;

export function ProjectsListClient() {
	const router = useRouter();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [viewMode, setViewMode] = useState<"table" | "card">(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("projects-view-mode");
			if (saved === "table" || saved === "card") {
				return saved;
			}
		}
		return "table";
	});

	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("projects-view-mode", viewMode);
		}
	}, [viewMode]);

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
							onClick={() => {
								if (isSorted === "desc") {
									column.clearSorting();
								} else {
									column.toggleSorting(isSorted === "asc");
								}
							}}
							className="-ml-4"
						>
							Project
							{isSorted === "asc" ? (
								<ChevronUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ChevronDown className="ml-2 h-4 w-2" />
							) : (
								<ChevronsUpDown className="ml-2 h-4 w-4" />
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
							onClick={() => {
								if (isSorted === "desc") {
									column.clearSorting();
								} else {
									column.toggleSorting(isSorted === "asc");
								}
							}}
							className="-ml-4"
						>
							Rig
							{isSorted === "asc" ? (
								<ChevronUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ChevronDown className="ml-2 h-4 w-2" />
							) : (
								<ChevronsUpDown className="ml-2 h-4 w-4" />
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
			{
				accessorKey: "projectPhase",
				id: "projectPhase",
				header: ({ column }) => {
					const isSorted = column.getIsSorted();
					return (
						<Button
							variant="ghost"
							onClick={() => {
								if (isSorted === "desc") {
									column.clearSorting();
								} else {
									column.toggleSorting(isSorted === "asc");
								}
							}}
							className="-ml-4"
						>
							Phase
							{isSorted === "asc" ? (
								<ChevronUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ChevronDown className="ml-2 h-4 w-2" />
							) : (
								<ChevronsUpDown className="ml-2 h-4 w-4" />
							)}
						</Button>
					);
				},
				cell: ({ row }) => (
					<div className="text-muted-foreground">
						{row.original.projectPhase || "—"}
					</div>
				),
				enableColumnFilter: true,
				filterFn: "equalsString",
			},
			{
				accessorKey: "projectStatus",
				id: "projectStatus",
				header: ({ column }) => {
					const isSorted = column.getIsSorted();
					return (
						<Button
							variant="ghost"
							onClick={() => {
								if (isSorted === "desc") {
									column.clearSorting();
								} else {
									column.toggleSorting(isSorted === "asc");
								}
							}}
							className="-ml-4"
						>
							Status
							{isSorted === "asc" ? (
								<ChevronUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ChevronDown className="ml-2 h-4 w-2" />
							) : (
								<ChevronsUpDown className="ml-2 h-4 w-4" />
							)}
						</Button>
					);
				},
				cell: ({ row }) => (
					<div className="text-muted-foreground">
						{row.original.projectStatus || "—"}
					</div>
				),
				enableColumnFilter: true,
				filterFn: "equalsString",
			},
			{
				accessorKey: "raptor_checklist_completion",
				id: "raptor",
				header: ({ column }) => {
					const isSorted = column.getIsSorted();
					return (
						<Button
							variant="ghost"
							onClick={() => {
								if (isSorted === "desc") {
									column.clearSorting();
								} else {
									column.toggleSorting(isSorted === "asc");
								}
							}}
							className="-ml-4"
						>
							RAPTOR
							{isSorted === "asc" ? (
								<ChevronUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ChevronDown className="ml-2 h-4 w-2" />
							) : (
								<ChevronsUpDown className="ml-2 h-4 w-4" />
							)}
						</Button>
					);
				},
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
							onClick={() => {
								if (isSorted === "desc") {
									column.clearSorting();
								} else {
									column.toggleSorting(isSorted === "asc");
								}
							}}
							className="-ml-4"
						>
							SIT
							{isSorted === "asc" ? (
								<ChevronUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ChevronDown className="ml-2 h-4 w-2" />
							) : (
								<ChevronsUpDown className="ml-2 h-4 w-4" />
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
							onClick={() => {
								if (isSorted === "desc") {
									column.clearSorting();
								} else {
									column.toggleSorting(isSorted === "asc");
								}
							}}
							className="-ml-4"
						>
							Doc
							{isSorted === "asc" ? (
								<ChevronUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ChevronDown className="ml-2 h-4 w-2" />
							) : (
								<ChevronsUpDown className="ml-2 h-4 w-4" />
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
							onClick={() => {
								if (isSorted === "desc") {
									column.clearSorting();
								} else {
									column.toggleSorting(isSorted === "asc");
								}
							}}
							className="-ml-4"
						>
							Remaining
							{isSorted === "asc" ? (
								<ChevronUp className="ml-2 h-4 w-4" />
							) : isSorted === "desc" ? (
								<ChevronDown className="ml-2 h-4 w-2" />
							) : (
								<ChevronsUpDown className="ml-2 h-4 w-4" />
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

	const getStatusColor = (status: string | null | undefined) => {
		switch (status) {
			case "Active":
				return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
			case "On Hold":
				return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
			case "Completed":
				return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
			case "Cancelled":
				return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
			default:
				return "bg-muted text-muted-foreground";
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
		<div className="flex flex-1 flex-col gap-4">
			{/* Filters */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
					onValueChange={(value) => {
						const currentValue = (table.getColumn("projectPhase")?.getFilterValue() as string) ?? "all";
						if (value === "all" || value === currentValue) {
							table.getColumn("projectPhase")?.setFilterValue(undefined);
						} else {
							table.getColumn("projectPhase")?.setFilterValue(value);
						}
					}}
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
					onValueChange={(value) => {
						const currentValue = (table.getColumn("projectStatus")?.getFilterValue() as string) ?? "all";
						if (value === "all" || value === currentValue) {
							table.getColumn("projectStatus")?.setFilterValue(undefined);
						} else {
							table.getColumn("projectStatus")?.setFilterValue(value);
						}
					}}
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
					onValueChange={(value) => {
						const currentValue = (table.getColumn("assetType")?.getFilterValue() as string) ?? "all";
						if (value === "all" || value === currentValue) {
							table.getColumn("assetType")?.setFilterValue(undefined);
						} else {
							table.getColumn("assetType")?.setFilterValue(value);
						}
					}}
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
				<div className="flex gap-1 border rounded-md p-1">
					<Button
						variant={viewMode === "table" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setViewMode("table")}
						className="h-8 w-8 p-0"
					>
						<List className="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === "card" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setViewMode("card")}
						className="h-8 w-8 p-0"
					>
						<LayoutGrid className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Table or Card View */}
			<div className="flex-1">
				{viewMode === "card" ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{table.getRowModel().rows.length === 0 ? (
						<div className="col-span-full py-12 text-center text-muted-foreground">
							No projects found
						</div>
					) : (
						table.getRowModel().rows.map((row) => {
							const item = row.original;
							return (
								<Card
									key={row.id}
									className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 flex flex-col"
									onClick={() => handleRowClick(item)}
								>
									<div className="flex-1 flex flex-col">
										<CardHeader className="pb-3 flex-shrink-0">
											<div className="flex items-start justify-between gap-2">
												<CardTitle className="text-base leading-tight line-clamp-2">
													{item.projectName || "Unknown Project"}
												</CardTitle>
												{item.projectStatus && (
													<span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap flex-shrink-0 ${getStatusColor(item.projectStatus)}`}>
														{item.projectStatus}
													</span>
												)}
											</div>
											<CardDescription className="text-sm">
												{item.assetName || "Unknown Rig"}
												{item.assetType && (
													<>
														{" • "}
														<span className="text-muted-foreground">{item.assetType}</span>
													</>
												)}
											</CardDescription>
										</CardHeader>
										<CardContent className="pb-3 flex-1">
											{item.projectPhase && (
												<div className="text-sm text-muted-foreground mb-3">
													Phase: <span className="font-medium text-foreground">{item.projectPhase}</span>
												</div>
											)}
											<div className="space-y-2">
												<div className="flex items-center justify-between text-xs">
													<span className="text-muted-foreground">RAPTOR</span>
													<CompletionBadge value={item.raptor_checklist_completion} />
												</div>
												<div className="flex items-center justify-between text-xs">
													<span className="text-muted-foreground">SIT</span>
													<CompletionBadge value={item.sit_completion} />
												</div>
												<div className="flex items-center justify-between text-xs">
													<span className="text-muted-foreground">Doc</span>
													<CompletionBadge value={item.doc_verification_completion} />
												</div>
											</div>
										</CardContent>
									</div>
									<CardFooter className="pt-3 border-t flex-shrink-0">
										<div className="text-sm text-muted-foreground">
											<span className="font-medium text-foreground">{item.checklist_remaining ?? 0}</span> items remaining
										</div>
									</CardFooter>
								</Card>
							);
						})
					)}
				</div>
			) : (
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
				)}
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

