"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";

interface GroupedBarChartProps {
  data: Array<{
    name: string;
    [key: string]: string | number;
  }>;
  bars: Array<{
    key: string;
    color: string;
    label: string;
  }>;
}

export function GroupedBarChart({ data, bars }: GroupedBarChartProps) {
  const chartConfig = bars.reduce((acc, bar) => {
    acc[bar.key] = {
      label: bar.label,
      color: bar.color,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              fill={bar.color}
              radius={4}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}







