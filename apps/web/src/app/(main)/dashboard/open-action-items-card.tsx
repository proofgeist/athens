"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RecentActivity } from "./dashboard";

export function OpenActionItemsCard() {
	const { data: actionStats } = useQuery(
		orpc.smartList.getStatusSummary.queryOptions({ input: {} })
	);
	const totalOpenItems = actionStats?.byStatus.Open ?? 0;

	return (
		<div className="group col-span-1 md:col-span-1 lg:col-span-4 rounded-xl border border-border bg-card flex flex-col w-full shadow-sm transition-all duration-300 hover:border-accent/50 hover:shadow-md">
			<div className="p-6 pb-4 flex items-start justify-between">
				<div>
					<h3 className="font-semibold text-foreground">Open Action Items</h3>
					<p className="text-sm text-muted-foreground">
						Items requiring your attention
					</p>
				</div>
				<Button variant="outline" size="sm" asChild>
					<Link href="/action-items">
						Show all ({totalOpenItems})
					</Link>
				</Button>
			</div>
			<div className="px-6 pb-6 flex-1">
				<RecentActivity />
			</div>
		</div>
	);
}

