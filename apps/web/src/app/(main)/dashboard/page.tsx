import { headers } from "next/headers";
import { auth } from "@athens/auth";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/utils/query-client";
import { createServerOrpc } from "@/utils/orpc-server";
import {
	DashboardStats,
	RecentActivity,
} from "./dashboard";
import { ActionItemsSummaryWrapper } from "./action-items-summary-wrapper";

export default async function DashboardPage() {
	// Session is guaranteed by layout protection - this call is cached
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	// Create server-side query client and orpc utils
	const queryClient = makeQueryClient();
	const orpc = await createServerOrpc();

	// Prefetch all dashboard data on the server
	await Promise.all([
		queryClient.prefetchQuery(orpc.projectAssets.getSummaryStats.queryOptions()),
		queryClient.prefetchQuery(orpc.smartList.getStatusSummary.queryOptions({ input: {} })),
		queryClient.prefetchQuery(
			orpc.smartList.list.queryOptions({
				input: {
					limit: 3,
					status: "Open",
					includeRelated: true,
				},
			})
		),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
				{/* Page header */}
				<div className="flex items-center justify-between py-4">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
						<p className="text-muted-foreground">
							Welcome back, {session?.user?.name}
						</p>
					</div>
				</div>

				{/* Stats cards - hydrated from server */}
				<DashboardStats />

				{/* Main content area */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
					<div className="col-span-4 rounded-xl border bg-card flex flex-col">
						<div className="p-6">
							<h3 className="font-semibold">Open Action Items</h3>
							<p className="text-sm text-muted-foreground">
								Items requiring your attention
							</p>
						</div>
						<div className="p-6 pt-0 flex-1 flex flex-col">
							<RecentActivity />
						</div>
					</div>
					<div className="col-span-3 rounded-xl border bg-card flex flex-col overflow-hidden">
						<ActionItemsSummaryWrapper />
					</div>
				</div>
			</div>
		</HydrationBoundary>
	);
}
