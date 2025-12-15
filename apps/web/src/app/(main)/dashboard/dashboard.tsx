"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BarChart, Bar, XAxis } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

export function DashboardStats() {
	const projectStats = useQuery(orpc.projectAssets.getSummaryStats.queryOptions());
	const actionStats = useQuery(orpc.smartList.getStatusSummary.queryOptions({ input: {} }));

	const isLoading = projectStats.isLoading || actionStats.isLoading;

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="rounded-xl border bg-card p-6">
						<Skeleton className="h-4 w-24 mb-2" />
						<Skeleton className="h-8 w-16 mb-1" />
						<Skeleton className="h-3 w-32" />
					</div>
				))}
			</div>
		);
	}

	const totalProjects = projectStats.data?.totalProjects ?? 0;
	const raptorCompletion = projectStats.data?.avgRaptorCompletion ?? 0;
	const openActions = actionStats.data?.byStatus.Open ?? 0;
	const highPriority = actionStats.data?.byPriorityAndStatus.High.Open ?? 0;

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<div className="rounded-xl border bg-card p-6">
				<div className="flex flex-row items-center justify-between space-y-0 pb-2">
					<h3 className="text-sm font-medium">Total Projects</h3>
				</div>
				<div className="text-2xl font-bold">{totalProjects}</div>
				<p className="text-xs text-muted-foreground">Active project assets</p>
			</div>
			<div className="rounded-xl border bg-card p-6">
				<div className="flex flex-row items-center justify-between space-y-0 pb-2">
					<h3 className="text-sm font-medium">RAPTOR Completion</h3>
				</div>
				<div className="text-2xl font-bold">{raptorCompletion}%</div>
				<p className="text-xs text-muted-foreground">Average checklist completion</p>
			</div>
			<div className="rounded-xl border bg-card p-6">
				<div className="flex flex-row items-center justify-between space-y-0 pb-2">
					<h3 className="text-sm font-medium">Open Action Items</h3>
				</div>
				<div className="text-2xl font-bold">{openActions}</div>
				<p className="text-xs text-muted-foreground">Items requiring attention</p>
			</div>
			<div className="rounded-xl border bg-card p-6">
				<div className="flex flex-row items-center justify-between space-y-0 pb-2">
					<h3 className="text-sm font-medium">High Priority</h3>
				</div>
				<div className={`text-2xl font-bold ${highPriority > 0 ? "text-destructive" : ""}`}>
					{highPriority}
				</div>
				<p className="text-xs text-muted-foreground">Open high-priority items</p>
			</div>
		</div>
	);
}

export function RecentActivity() {
	const actionItems = useQuery(
		orpc.smartList.list.queryOptions({
			input: {
				limit: 3,
				status: "Open",
				includeRelated: true, // Include project/asset info
			},
		})
	);

	const actionStats = useQuery(orpc.smartList.getStatusSummary.queryOptions({ input: {} }));
	const totalOpenItems = actionStats.data?.byStatus.Open ?? 0;

	if (actionItems.isLoading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="flex items-center gap-4">
						<Skeleton className="h-2 w-2 rounded-full" />
						<div className="flex-1">
							<Skeleton className="h-4 w-48 mb-1" />
							<Skeleton className="h-3 w-32" />
						</div>
						<Skeleton className="h-5 w-16" />
					</div>
				))}
				<Skeleton className="h-9 w-full mt-4" />
			</div>
		);
	}

	const items = actionItems.data?.data ?? [];

	if (items.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">No recent activity</p>
		);
	}

	return (
		<div className="space-y-4 flex-1 flex flex-col">
			<div className="flex-1">
				{items.map((item) => {
				// Extract enriched project/asset names (typed from API output schema)
				const projectName = item.projectName;
				const assetName = item.assetName;
				const contextInfo = projectName || assetName 
					? `${projectName ?? ""}${projectName && assetName ? " • " : ""}${assetName ?? ""}`
					: item.system_group || "General";

				return (
					<div key={item.id} className="flex items-center gap-4">
						<div
							className={`h-2 w-2 rounded-full flex-shrink-0 ${
								item.priority === "High"
									? "bg-destructive"
									: item.priority === "Medium"
										? "bg-yellow-500"
										: "bg-primary"
							}`}
						/>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate">{item.title}</p>
							<p className="text-xs text-muted-foreground truncate">
								{contextInfo}
							</p>
						</div>
						<span
							className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
								item.priority === "High"
									? "bg-destructive/10 text-destructive"
									: item.priority === "Medium"
										? "bg-yellow-500/10 text-yellow-600"
										: "bg-primary/10 text-primary"
							}`}
						>
							{item.priority}
						</span>
					</div>
				);
				})}
			</div>
			{totalOpenItems > 3 && (
				<Button
					variant="outline"
					className="w-full mt-4"
					asChild
				>
					<Link href={"/action-items" as any}>
						Show all ({totalOpenItems})
					</Link>
				</Button>
			)}
		</div>
	);
}

const chartConfig = {
	open: {
		label: "Open",
		color: "hsl(var(--destructive))",
	},
	closed: {
		label: "Closed",
		color: "hsl(142, 71%, 45%)",
	},
} satisfies ChartConfig;

export function ActionItemsSummaryHeader({
	showClosed,
	setShowClosed,
}: {
	showClosed: boolean;
	setShowClosed: (value: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between">
			<div>
				<h3 className="font-semibold">Action Items Summary</h3>
				<p className="text-sm text-muted-foreground">
					Breakdown by priority
				</p>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<MoreVertical className="h-4 w-4" />
						<span className="sr-only">More options</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuCheckboxItem
						checked={showClosed}
						onCheckedChange={setShowClosed}
					>
						Show completed
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export function ActionItemsSummary({
	showClosed,
	setShowClosed,
}: {
	showClosed: boolean;
	setShowClosed: (value: boolean) => void;
}) {
	const stats = useQuery(orpc.smartList.getStatusSummary.queryOptions({ input: {} }));

	if (stats.isLoading) {
		return (
			<div className="h-[150px] flex items-center justify-center">
				<Skeleton className="h-full w-full" />
			</div>
		);
	}

	const data = stats.data;
	if (!data) return null;

	// Transform data for chart
	const chartData = [
		{
			priority: "Low",
			open: data.byPriorityAndStatus.Low.Open,
			closed: showClosed ? data.byPriorityAndStatus.Low.Closed : 0,
		},
		{
			priority: "Medium",
			open: data.byPriorityAndStatus.Medium.Open,
			closed: showClosed ? data.byPriorityAndStatus.Medium.Closed : 0,
		},
		{
			priority: "High",
			open: data.byPriorityAndStatus.High.Open,
			closed: showClosed ? data.byPriorityAndStatus.High.Closed : 0,
		},
	];

	return (
		<div className="h-[150px] w-full overflow-hidden max-w-full">
			<ChartContainer config={chartConfig} className="!h-[150px] w-full max-w-full">
				<BarChart
					accessibilityLayer
					data={chartData}
					margin={{
						top: 5,
						right: 5,
						left: 0,
						bottom: 0,
					}}
				>
					<XAxis
						dataKey="priority"
						tickLine={false}
						tickMargin={10}
						axisLine={false}
						tick={{ fill: "hsl(var(--muted-foreground))" }}
					/>
					<Bar
						dataKey="open"
						stackId="a"
						fill="var(--color-open)"
						radius={showClosed ? [0, 0, 0, 0] : [4, 4, 4, 4]}
					/>
					{showClosed && (
						<Bar
							dataKey="closed"
							stackId="a"
							fill="var(--color-closed)"
							radius={[4, 4, 0, 0]}
						/>
					)}
					<ChartTooltip
						content={<ChartTooltipContent />}
						cursor={false}
					/>
				</BarChart>
			</ChartContainer>
		</div>
	);
}
