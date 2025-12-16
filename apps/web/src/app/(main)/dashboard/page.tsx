import { headers } from "next/headers";
import { auth } from "@athens/auth";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/utils/query-client";
import { createServerOrpc } from "@/utils/orpc-server";
import {
	DashboardStats,
	RecentActivity,
} from "./dashboard";
import { ActionItemsSummaryCard } from "./action-items-summary-card";
import { ProjectAssetsCard } from "./project-assets-card";
import { OpenActionItemsCard } from "./open-action-items-card";

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
		queryClient.prefetchQuery(orpc.projectAssets.listForDashboard.queryOptions()),
		queryClient.prefetchQuery(orpc.smartList.getStatusSummary.queryOptions({ input: {} })),
		queryClient.prefetchQuery(
			orpc.smartList.list.queryOptions({
				input: {
					limit: 4,
					status: "Open",
					includeRelated: true,
				},
			})
		),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-x-hidden">
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
					<OpenActionItemsCard />
					<ActionItemsSummaryCard />
				</div>

				{/* Project assets overview */}
				<div className="grid gap-4">
					<ProjectAssetsCard />
				</div>
			</div>
		</HydrationBoundary>
	);
}
