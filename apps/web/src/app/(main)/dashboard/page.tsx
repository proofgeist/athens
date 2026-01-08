import { headers } from "next/headers";
import { auth } from "@athens/auth";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/utils/query-client";
import { createServerOrpc } from "@/utils/orpc-server";
import {
	DashboardStats,
} from "./dashboard";
import { ProjectAssetsCard } from "./project-assets-card";

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
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-x-hidden h-full">
				{/* Page header */}
				<div className="flex items-center justify-between py-4 border-b border-border/50">
					<div>
						<h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Welcome back, {session?.user?.name}
						</p>
					</div>
				</div>

				{/* Stats cards - hydrated from server */}
				<DashboardStats />

				{/* Project assets overview */}
				<div className="grid gap-4">
					<ProjectAssetsCard />
				</div>
			</div>
		</HydrationBoundary>
	);
}
