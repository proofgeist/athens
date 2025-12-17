import { headers } from "next/headers";
import { auth } from "@athens/auth";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/utils/query-client";
import { createServerOrpc } from "@/utils/orpc-server";
import { ProjectsListClient } from "./projects-list-client";

export default async function ProjectsPage() {
	// Session is guaranteed by layout protection - this call is cached
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	// Create server-side query client and orpc utils
	const queryClient = makeQueryClient();
	const orpc = await createServerOrpc();

	// Prefetch initial data
	await queryClient.prefetchQuery(
		orpc.projectAssets.listDetailed.queryOptions({
			input: {
				limit: 20,
				offset: 0,
			},
		})
	);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full">
				<div className="flex flex-1 flex-col min-h-0">
					<ProjectsListClient />
				</div>
			</div>
		</HydrationBoundary>
	);
}