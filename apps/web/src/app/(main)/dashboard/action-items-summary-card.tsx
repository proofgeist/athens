"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, LabelList, CartesianGrid, Cell } from "recharts";
import {
	ChartContainer,
	type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
	low: {
		label: "Low",
		color: "hsl(var(--primary))",
	},
	medium: {
		label: "Medium",
		color: "hsl(38, 92%, 50%)",
	},
	high: {
		label: "High",
		color: "hsl(0, 84%, 60%)",
	},
} satisfies ChartConfig;

function ActionItemsSummaryHeader() {
	return (
		<div>
			<h3 className="font-semibold">Action Items Summary</h3>
		</div>
	);
}

function ActionItemsSummary() {
	const router = useRouter();
	const stats = useQuery(orpc.smartList.getStatusSummary.queryOptions({ input: {} }));

	if (stats.isLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<Skeleton className="h-full w-full" />
			</div>
		);
	}

	const data = stats.data;
	if (!data) return null;

	// Transform data for chart - only open items
	const chartData = useMemo(() => [
		{
			priority: "Low",
			count: data.byPriorityAndStatus.Low.Open,
			fill: "var(--color-low)",
		},
		{
			priority: "Medium",
			count: data.byPriorityAndStatus.Medium.Open,
			fill: "var(--color-medium)",
		},
		{
			priority: "High",
			count: data.byPriorityAndStatus.High.Open,
			fill: "var(--color-high)",
		},
	], [data]);

	const handleBarClick = (priority: string) => {
		router.push(`/action-items?priority=${priority.toLowerCase()}` as any);
	};

	const labelList = useMemo(() => (
		<LabelList
			position="top"
			offset={12}
			className="fill-foreground"
			fontSize={12}
		/>
	), []);

	return (
		<>
			<style dangerouslySetInnerHTML={{
				__html: `
					.recharts-bar-rectangle {
						transition: filter 0.2s ease-in-out !important;
						cursor: pointer !important;
					}
					.recharts-bar-rectangle:hover {
						filter: brightness(0.85) !important;
					}
				`
			}} />
			<ChartContainer config={chartConfig} className="h-full w-full">
				<BarChart
					accessibilityLayer
					data={chartData}
					margin={{
						top: 30,
					}}
				>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey="priority"
						tickLine={false}
						tickMargin={10}
						axisLine={false}
					/>
					<Bar 
						dataKey="count" 
						radius={8}
						onClick={(data: { priority: string }) => handleBarClick(data.priority)}
						style={{ cursor: "pointer" }}
					>
						{chartData.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={entry.fill}
							/>
						))}
						{labelList}
					</Bar>
				</BarChart>
			</ChartContainer>
		</>
	);
}

export function ActionItemsSummaryCard() {
	return (
		<div className="col-span-3 rounded-xl border bg-card flex flex-col overflow-hidden">
			<div className="flex flex-col flex-1 min-h-0">
				<div className="p-6 pb-0">
					<ActionItemsSummaryHeader />
				</div>
				<div className="flex-1 p-4 min-h-0">
					<ActionItemsSummary />
				</div>
			</div>
		</div>
	);
}

