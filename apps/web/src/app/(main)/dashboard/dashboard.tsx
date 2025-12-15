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
		<div className="space-y-4">
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

export function ActionItemsSummary() {
	const stats = useQuery(orpc.smartList.getStatusSummary.queryOptions({ input: {} }));

	if (stats.isLoading) {
		return (
			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="flex justify-between">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-4 w-12" />
					</div>
				))}
			</div>
		);
	}

	const data = stats.data;
	if (!data) return null;

	return (
		<div className="space-y-3">
			<div className="flex justify-between items-center">
				<span className="text-sm">High Priority</span>
				<div className="flex gap-2">
					<span className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive">
						{data.byPriorityAndStatus.High.Open} open
					</span>
					<span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-600">
						{data.byPriorityAndStatus.High.Closed} closed
					</span>
				</div>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-sm">Medium Priority</span>
				<div className="flex gap-2">
					<span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-600">
						{data.byPriorityAndStatus.Medium.Open} open
					</span>
					<span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-600">
						{data.byPriorityAndStatus.Medium.Closed} closed
					</span>
				</div>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-sm">Low Priority</span>
				<div className="flex gap-2">
					<span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
						{data.byPriorityAndStatus.Low.Open} open
					</span>
					<span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-600">
						{data.byPriorityAndStatus.Low.Closed} closed
					</span>
				</div>
			</div>
			<div className="pt-2 border-t mt-3">
				<div className="flex justify-between items-center font-medium">
					<span className="text-sm">Total</span>
					<span className="text-sm">{data.total} items</span>
				</div>
			</div>
		</div>
	);
}
