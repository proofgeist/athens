"use client";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStats() {
	const projectStats = useQuery(orpc.projectAssets.getSummaryStats.queryOptions());

	if (projectStats.isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2">
				{[1, 2].map((i) => (
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

	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-2">
			<div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-accent/50 hover:shadow-md hover:translate-y-[-2px]">
				<div className="flex flex-row items-center justify-between space-y-0 pb-2">
					<h3 className="text-xs font-medium text-muted-foreground">Total Projects</h3>
				</div>
				<div className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">{totalProjects}</div>
				<p className="text-[10px] text-muted-foreground/70">Active project assets</p>
			</div>
			<div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-accent/50 hover:shadow-md hover:translate-y-[-2px]">
				<div className="flex flex-row items-center justify-between space-y-0 pb-2">
					<h3 className="text-xs font-medium text-muted-foreground">RAPTOR Completion</h3>
				</div>
				<div className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-accent">{raptorCompletion}%</div>
				<p className="text-[10px] text-muted-foreground/70">Average checklist completion</p>
			</div>
		</div>
	);
}

