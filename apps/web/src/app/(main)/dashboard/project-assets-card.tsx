"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CompletionBadge } from "@/components/completion-badge";
import Link from "next/link";

function ProjectAssetRow({ item }: { item: any }) {
	const router = useRouter();

	const handleClick = () => {
		router.push(`/projects/${item.project_id}` as any);
	};

	return (
		<tr
			onClick={handleClick}
			className="cursor-pointer hover:bg-muted/50 transition-colors"
		>
			<td className="py-3 px-4 text-sm font-medium whitespace-nowrap">
				<div className="max-w-[200px] truncate">
					{item.projectName || "Unknown Project"}
				</div>
			</td>
			<td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
				<div className="max-w-[150px] truncate">
					{item.assetName || "Unknown Asset"}
				</div>
			</td>
			<td className="py-3 px-4 text-sm">
				<CompletionBadge value={item.raptor_checklist_completion} />
			</td>
			<td className="py-3 px-4 text-sm">
				<CompletionBadge value={item.sit_completion} />
			</td>
			<td className="py-3 px-4 text-sm">
				<CompletionBadge value={item.doc_verification_completion} />
			</td>
		</tr>
	);
}

function ProjectAssetsList() {
	const { data, isLoading } = useQuery(
		orpc.projectAssets.listForDashboard.queryOptions()
	);

	if (isLoading) {
		return (
			<div className="space-y-3">
				{[1, 2, 3, 4, 5].map((i) => (
					<Skeleton key={i} className="h-12 w-full" />
				))}
			</div>
		);
	}

	const items = data?.data ?? [];

	if (items.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-sm text-muted-foreground">No project assets found</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto -mx-6 px-6">
			<table className="w-full min-w-[600px]">
				<thead>
					<tr className="border-b">
						<th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
							Project
						</th>
						<th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
							Asset
						</th>
						<th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
							RAPTOR
						</th>
						<th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
							SIT
						</th>
						<th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
							Doc
						</th>
					</tr>
				</thead>
				<tbody className="divide-y">
					{items.map((item) => (
						<ProjectAssetRow key={item.id} item={item} />
					))}
				</tbody>
			</table>
		</div>
	);
}

export function ProjectAssetsCard() {
	const { data: stats } = useQuery(
		orpc.projectAssets.getSummaryStats.queryOptions()
	);
	const totalCount = stats?.totalProjects ?? 0;

	return (
		<div className="col-span-7 rounded-xl border bg-card flex flex-col">
			<div className="p-6 pb-4 flex items-start justify-between">
				<div>
					<h3 className="font-semibold">Project Overview</h3>
					<p className="text-sm text-muted-foreground">
						Completion status across projects
					</p>
				</div>
				<Button variant="outline" size="sm" asChild>
					<Link href={"/projects" as any}>
						Show all ({totalCount})
					</Link>
				</Button>
			</div>
			<div className="pb-4 flex-1 min-w-0">
				<ProjectAssetsList />
			</div>
		</div>
	);
}

