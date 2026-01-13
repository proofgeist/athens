"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
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
import { ProjectStatusSchema } from "@athens/api/schemas/Projects";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { CompletionBadge } from "@/components/completion-badge";
import { CircularProgress } from "@/components/charts/circular-progress";
import { Card, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, LayoutGrid, List, Calendar, Ship, Briefcase, Filter, Check } from "lucide-react";

type ProjectAssetItem = z.infer<typeof projectAssetDetailedItemSchema>;

export function ProjectsListClient() {
	const router = useRouter();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [viewMode, setViewMode] = useLocalStorage<"table" | "card">("projects-view-mode", "card");
	const [statusOpen, setStatusOpen] = useState(false);
	const [rigTypeOpen, setRigTypeOpen] = useState(false);

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
					<div className="flex flex-col">
						<div>{row.original.assetName || "Unknown Rig"}</div>
						{row.original.assetType && (
							<div className="text-muted-foreground text-xs">
								{row.original.assetType}
							</div>
						)}
					</div>
				),
				enableGlobalFilter: true, // Include in global search
			},
			{
				accessorKey: "assetType",
				id: "assetType",
				header: () => null,
				cell: () => null,
				enableColumnFilter: true,
				filterFn: "equalsString",
				enableHiding: true,
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
				accessorKey: "projectStartDate",
				id: "projectDates",
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
							Date Range
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
				cell: ({ row }) => {
					const startDate = row.original.projectStartDate
						? new Date(row.original.projectStartDate).toLocaleDateString(undefined, {
								month: "numeric",
								day: "numeric",
								year: "numeric",
						  })
						: null;
					const endDate = row.original.projectEndDate
						? new Date(row.original.projectEndDate).toLocaleDateString(undefined, {
								month: "numeric",
								day: "numeric",
								year: "numeric",
						  })
						: null;

					if (!startDate && !endDate) {
						return <div className="text-muted-foreground">—</div>;
					}

					return (
						<div className="text-muted-foreground">
							{startDate || "?"}
							{startDate && endDate && "-"}
							{endDate || "?"}
						</div>
					);
				},
				sortingFn: (rowA, rowB) => {
					const dateA = rowA.original.projectStartDate
						? new Date(rowA.original.projectStartDate).getTime()
						: 0;
					const dateB = rowB.original.projectStartDate
						? new Date(rowB.original.projectStartDate).getTime()
						: 0;
					return dateA - dateB;
				},
			},
			{
				accessorKey: "overall_completion",
				id: "overall_completion",
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
							Overall
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
					<CompletionBadge value={row.original.overall_completion} />
				),
			},
			{
				accessorKey: "checklist_percent",
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
					<CompletionBadge value={row.original.checklist_percent} />
				),
			},
			{
				accessorKey: "doc_percent",
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
					<CompletionBadge value={row.original.doc_percent} />
				),
			},
			{
				accessorKey: "sit_percent",
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
					<CompletionBadge value={row.original.sit_percent} />
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
			columnVisibility: {
				assetType: false,
			},
		},
	});

	const handleRowClick = (row: ProjectAssetItem) => {
		if (row.id) {
			router.push(`/projects/${row.id}`);
		}
	};

	type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

	const getStatusColor = (status: ProjectStatus | null | undefined): string => {
		if (!status) return "bg-muted text-muted-foreground";

		switch (status) {
			case "In Progress":
				return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
			case "Before Start":
				return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
			case "Completed":
				return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
			case "Cancelled":
				return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
			case "Closed":
				return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
			case "Closeable":
				return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
			case "Verbal":
				return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
			case "Unknown":
			default:
				return "bg-muted text-muted-foreground";
		}
	};

	const getReadinessScoreColor = (score: number | null | undefined): string => {
		if (score === null || score === undefined) return "bg-muted text-muted-foreground";
		
		// Red: 0-59, Yellow: 60-79, Green: 80-100
		if (score >= 80) {
			return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
		} else if (score >= 60) {
			return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
		} else {
			return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
		}
	};

	const getStatusDotColor = (status: ProjectStatus | null | undefined): string => {
		if (!status) return "bg-muted-foreground";

		switch (status) {
			case "In Progress":
				return "bg-green-500";
			case "Before Start":
				return "bg-yellow-500";
			case "Completed":
				return "bg-blue-500";
			case "Cancelled":
				return "bg-red-500";
			case "Closed":
				return "bg-gray-500";
			case "Closeable":
				return "bg-purple-500";
			case "Verbal":
				return "bg-orange-500";
			case "Unknown":
			default:
				return "bg-muted-foreground";
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				{/* Search and Filters Skeleton */}
				<div className="flex gap-4">
					<Skeleton className="h-10 flex-1" />
					<Skeleton className="h-10 w-40" />
					<Skeleton className="h-10 w-40" />
					<Skeleton className="h-10 w-20" />
				</div>
				{/* Card Grid Skeleton */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Card key={i} className="flex flex-col overflow-hidden py-0 gap-0">
							<div className="flex-1 flex flex-col">
								<div className="p-4 space-y-3 relative">
									{/* Header Section Skeleton */}
									<div className="space-y-1.5 pr-[120px]">
										<Skeleton className="h-5 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
									</div>
									{/* Circular Progress Skeleton - Absolute Positioned */}
									<div className="absolute top-4 right-4">
										<Skeleton className="h-[110px] w-[110px] rounded-full" />
									</div>
									{/* Info Grid Skeleton */}
									<div className="grid gap-2 pr-[120px]">
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-2/3" />
										<Skeleton className="h-4 w-3/4" />
									</div>
								</div>
								{/* Metrics Bar Skeleton */}
								<div className="mt-auto border-t bg-muted/30 p-3">
									<div className="grid grid-cols-3 gap-3">
										{[1, 2, 3].map((j) => (
											<div key={j} className="flex flex-col gap-1">
												<Skeleton className="h-3 w-12" />
												<Skeleton className="h-6 w-16" />
												<Skeleton className="h-3 w-20" />
											</div>
										))}
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		);
	}

	const statusFilter = (table.getColumn("projectStatus")?.getFilterValue() as string) ?? "all";
	const assetTypeFilter = (table.getColumn("assetType")?.getFilterValue() as string) ?? "all";
	
	const getStatusLabel = (value: string) => {
		if (value === "all") return "All Statuses";
		return value;
	};
	
	const getAssetTypeLabel = (value: string) => {
		if (value === "all") return "All Types";
		return value;
	};

	const handleStatusFilter = (value: string) => {
		if (value === "all") {
			table.getColumn("projectStatus")?.setFilterValue(undefined);
		} else {
			table.getColumn("projectStatus")?.setFilterValue(value);
		}
	};

	const handleAssetTypeFilter = (value: string) => {
		if (value === "all") {
			table.getColumn("assetType")?.setFilterValue(undefined);
		} else {
			table.getColumn("assetType")?.setFilterValue(value);
		}
	};

	return (
		<div className="flex flex-1 flex-col gap-4">
			{/* Filters */}
			<div className="flex items-center gap-2">
				<Input
					placeholder="Search projects and rigs..."
					value={globalFilter ?? ""}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="flex-1 h-9"
					type="search"
				/>
				
				{/* Mobile: Filters Menu */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="sm:hidden h-9">
							<Filter className="h-4 w-4 mr-2" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-64 max-h-[80vh] overflow-y-auto">
						<DropdownMenuLabel>Filters</DropdownMenuLabel>
						<DropdownMenuSeparator />
						
						{/* Status Collapsible Section */}
						<Collapsible open={statusOpen} onOpenChange={setStatusOpen}>
							<CollapsibleTrigger asChild>
								<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
									<span>Status</span>
									<ChevronDown className={`h-4 w-4 transition-transform duration-200 ${statusOpen ? "rotate-180" : ""}`} />
								</DropdownMenuItem>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<div className="px-2 py-1 space-y-1">
									<DropdownMenuItem onClick={() => handleStatusFilter("all")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${statusFilter === "all" ? "opacity-100" : "opacity-0"}`} />
										All Statuses
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleStatusFilter("Closeable")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${statusFilter === "Closeable" ? "opacity-100" : "opacity-0"}`} />
										Closeable
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleStatusFilter("Verbal")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${statusFilter === "Verbal" ? "opacity-100" : "opacity-0"}`} />
										Verbal
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleStatusFilter("Before Start")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${statusFilter === "Before Start" ? "opacity-100" : "opacity-0"}`} />
										Before Start
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleStatusFilter("In Progress")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${statusFilter === "In Progress" ? "opacity-100" : "opacity-0"}`} />
										In Progress
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleStatusFilter("Completed")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${statusFilter === "Completed" ? "opacity-100" : "opacity-0"}`} />
										Completed
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleStatusFilter("Cancelled")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${statusFilter === "Cancelled" ? "opacity-100" : "opacity-0"}`} />
										Cancelled
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleStatusFilter("Closed")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${statusFilter === "Closed" ? "opacity-100" : "opacity-0"}`} />
										Closed
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleStatusFilter("Unknown")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${statusFilter === "Unknown" ? "opacity-100" : "opacity-0"}`} />
										Unknown
									</DropdownMenuItem>
								</div>
							</CollapsibleContent>
						</Collapsible>
						
						<DropdownMenuSeparator />
						
						{/* Rig Type Collapsible Section */}
						<Collapsible open={rigTypeOpen} onOpenChange={setRigTypeOpen}>
							<CollapsibleTrigger asChild>
								<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
									<span>Rig Type</span>
									<ChevronDown className={`h-4 w-4 transition-transform duration-200 ${rigTypeOpen ? "rotate-180" : ""}`} />
								</DropdownMenuItem>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<div className="px-2 py-1 space-y-1">
									<DropdownMenuItem onClick={() => handleAssetTypeFilter("all")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${assetTypeFilter === "all" ? "opacity-100" : "opacity-0"}`} />
										All Types
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleAssetTypeFilter("Drilling")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${assetTypeFilter === "Drilling" ? "opacity-100" : "opacity-0"}`} />
										Drilling
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleAssetTypeFilter("Production")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${assetTypeFilter === "Production" ? "opacity-100" : "opacity-0"}`} />
										Production
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleAssetTypeFilter("Workover")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${assetTypeFilter === "Workover" ? "opacity-100" : "opacity-0"}`} />
										Workover
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleAssetTypeFilter("Jack-up")} className="pl-8">
										<Check className={`h-4 w-4 mr-2 ${assetTypeFilter === "Jack-up" ? "opacity-100" : "opacity-0"}`} />
										Jack-up
									</DropdownMenuItem>
								</div>
							</CollapsibleContent>
						</Collapsible>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Desktop: Individual Selects */}
				<Select
					value={statusFilter}
					onValueChange={handleStatusFilter}
				>
					<SelectTrigger className="hidden sm:flex w-40">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="Closeable">Closeable</SelectItem>
						<SelectItem value="Verbal">Verbal</SelectItem>
						<SelectItem value="Before Start">Before Start</SelectItem>
						<SelectItem value="In Progress">In Progress</SelectItem>
						<SelectItem value="Completed">Completed</SelectItem>
						<SelectItem value="Cancelled">Cancelled</SelectItem>
						<SelectItem value="Closed">Closed</SelectItem>
						<SelectItem value="Unknown">Unknown</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={assetTypeFilter}
					onValueChange={handleAssetTypeFilter}
				>
					<SelectTrigger className="hidden sm:flex w-40">
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
				
				<div className="flex gap-1 border rounded-md p-1 h-9">
					<Button
						variant={viewMode === "table" ? "secondary" : "ghost"}
						onClick={() => setViewMode("table")}
						className="h-7 w-7 p-0"
					>
						<List className="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === "card" ? "secondary" : "ghost"}
						onClick={() => setViewMode("card")}
						className="h-7 w-7 p-0"
					>
						<LayoutGrid className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Table or Card View */}
			<div className="flex-1">
				{viewMode === "card" ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
									className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-accent/50 hover:bg-accent/5 flex flex-col overflow-hidden py-0 gap-0"
									onClick={() => handleRowClick(item)}
								>
									<div className="flex-1 flex flex-col">
										<div className="p-4 space-y-3 relative">
											{/* Header Section */}
											<div className="space-y-1.5 pr-[120px]">
												<CardTitle className="text-base font-semibold leading-tight line-clamp-2">
													{item.projectName || "Unknown Project"}
												</CardTitle>
											</div>

											{/* Circular Progress - Absolute Positioned */}
											<div className="absolute top-4 right-4">
												<CircularProgress 
													value={item.overall_completion ?? 0} 
													label={`Overall\nReadiness`}
													size="sm"
													labelInside={true}
												/>
											</div>

											{/* Info Grid */}
											<div className="grid gap-2 text-sm text-muted-foreground pr-[120px]">
												<div className="flex items-start gap-1.5 text-sm text-muted-foreground">
													<Ship className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
													<span className="break-words">
														{item.assetName || "Unknown Rig"}
														{item.assetType && (
															<span className="text-muted-foreground/70"> • {item.assetType}</span>
														)}
													</span>
												</div>
												{item.projectStatus && (
													<div className="flex items-center gap-2">
														<Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
														<span className="text-sm">{item.projectStatus}</span>
														<span className={`h-2 w-2 rounded-full flex-shrink-0 ${getStatusDotColor(item.projectStatus)}`} />
													</div>
												)}
												{(item.projectStartDate || item.projectEndDate) && (
													<div className="flex items-center gap-2">
														<Calendar className="h-3.5 w-3.5 flex-shrink-0" />
														<span className="truncate">
															{item.projectStartDate ? new Date(item.projectStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "?"}
															{" - "}
															{item.projectEndDate ? new Date(item.projectEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "?"}
														</span>
													</div>
												)}
											</div>
										</div>

										{/* Metrics Bar */}
										<div className="mt-auto border-t bg-muted/30 p-3">
											{/* Readiness Metrics in One Row */}
											<div className="grid grid-cols-3 gap-3">
												<div className="flex flex-col gap-1">
													<span className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">RAPTOR</span>
													<CompletionBadge value={item.checklist_percent} />
													<span className="font-mono text-[10px] text-muted-foreground mt-0.5 tabular-nums">
														{item.checklist_remaining ?? 0} Items Remaining
													</span>
												</div>
												<div className="flex flex-col gap-1">
													<span className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Doc</span>
													<CompletionBadge value={item.doc_percent} />
													<span className="font-mono text-[10px] text-muted-foreground mt-0.5 tabular-nums">
														{item.doc_remaining ?? 0} Docs Remaining
													</span>
												</div>
												<div className="flex flex-col gap-1">
													<span className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">SIT</span>
													<CompletionBadge value={item.sit_percent} />
													<span className="font-mono text-[10px] text-muted-foreground mt-0.5 tabular-nums">
														{item.sit_remaining ?? 0} Tests Remaining
													</span>
												</div>
											</div>
										</div>
									</div>
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
										colSpan={table.getVisibleFlatColumns().length}
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

