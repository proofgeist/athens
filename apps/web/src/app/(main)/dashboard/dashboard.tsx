"use client";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
		<div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<div className="rounded-xl border bg-card p-6 shadow-sm">
				<div className="flex flex-row items-center justify-between space-y-0 pb-2">
					<h3 className="text-xs font-medium text-muted-foreground">Total Projects</h3>
				</div>
				<div className="font-mono text-2xl font-semibold tabular-nums tracking-tight">{totalProjects}</div>
				<p className="text-[10px] text-muted-foreground/70">Active project assets</p>
			</div>
			<div className="rounded-xl border bg-card p-6 shadow-sm">
				<div className="flex flex-row items-center justify-between space-y-0 pb-2">
					<h3 className="text-xs font-medium text-muted-foreground">RAPTOR Completion</h3>
				</div>
				<div className="font-mono text-2xl font-semibold tabular-nums tracking-tight">{raptorCompletion}%</div>
				<p className="text-[10px] text-muted-foreground/70">Average checklist completion</p>
			</div>
			<div className="rounded-xl border bg-card p-6 shadow-sm">
				<div className="flex flex-row items-center justify-between space-y-0 pb-2">
					<h3 className="text-xs font-medium text-muted-foreground">Open Action Items</h3>
				</div>
				<div className="font-mono text-2xl font-semibold tabular-nums tracking-tight">{openActions}</div>
				<p className="text-[10px] text-muted-foreground/70">Items requiring attention</p>
			</div>
			<div className="rounded-xl border bg-card p-6 shadow-sm">
				<div className="flex flex-row items-center justify-between space-y-0 pb-2">
					<h3 className="text-xs font-medium text-muted-foreground">High Priority</h3>
				</div>
				<div className={`font-mono text-2xl font-semibold tabular-nums tracking-tight ${highPriority > 0 ? "text-destructive" : ""}`}>
					{highPriority}
				</div>
				<p className="text-[10px] text-muted-foreground/70">Open high-priority items</p>
			</div>
		</div>
	);
}

export function RecentActivity() {
	const actionItems = useQuery(
		orpc.smartList.list.queryOptions({
			input: {
				limit: 4,
				status: "Open",
				includeRelated: true, // Include project/asset info
			},
		})
	);

	if (actionItems.isLoading) {
		return (
			<div className="space-y-2">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="flex items-center gap-4">
						<Skeleton className="h-2 w-2 rounded-full" />
						<div className="flex-1">
							<Skeleton className="h-4 w-48 mb-1" />
							<Skeleton className="h-3 w-32" />
						</div>
						<Skeleton className="h-5 w-16" />
					</div>
				))}
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
		<div className="space-y-2">
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
	);
}

