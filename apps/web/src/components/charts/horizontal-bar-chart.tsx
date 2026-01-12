"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface HorizontalBarChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
}

export function HorizontalBarChart({ data }: HorizontalBarChartProps) {
  const chartConfig = data.reduce((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: item.color || "hsl(var(--primary))",
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" radius={4}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || "hsl(var(--primary))"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

