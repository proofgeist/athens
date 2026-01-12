"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Rectangle } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";

interface BarConfig {
  key: string;
  color: string;
  label: string;
  stackId?: string;
}

interface GroupedBarChartProps {
  data: Array<{
    name: string;
    [key: string]: string | number;
  }>;
  bars: BarConfig[];
}

// Custom shape component that dynamically determines corner rounding based on actual data
function createStackAwareShape(
  barKey: string,
  stackId: string | undefined,
  allBars: BarConfig[],
  chartData: GroupedBarChartProps["data"]
) {
  // For non-stacked bars, return a simple rectangle with all corners rounded
  if (!stackId) {
    return (props: any) => <Rectangle {...props} radius={4} />;
  }

  // Get all bars in this stack, in render order (first = bottom, last = top)
  const stackBars = allBars.filter((b) => b.stackId === stackId);
  const currentBarIndex = stackBars.findIndex((b) => b.key === barKey);

  return (props: any) => {
    const { payload } = props;

    // Find which bars in the stack have actual data (value > 0) for this data point
    const barsWithData = stackBars.filter((b) => {
      const value = payload?.[b.key];
      return typeof value === "number" && value > 0;
    });

    // If this bar has no data, Recharts won't render it anyway
    const currentValue = payload?.[barKey];
    if (typeof currentValue !== "number" || currentValue <= 0) {
      return <Rectangle {...props} radius={0} />;
    }

    // Determine position of this bar among bars that actually have data
    const dataBarIndex = barsWithData.findIndex((b) => b.key === barKey);
    const isBottom = dataBarIndex === 0;
    const isTop = dataBarIndex === barsWithData.length - 1;
    const isOnly = barsWithData.length === 1;

    // Determine radius based on actual position in the rendered stack
    // [topLeft, topRight, bottomRight, bottomLeft]
    let radius: [number, number, number, number] | number;

    if (isOnly) {
      // Only bar with data: round all corners
      radius = 4;
    } else if (isBottom && isTop) {
      // Shouldn't happen, but handle edge case
      radius = 4;
    } else if (isBottom) {
      // Bottom of stack: round bottom corners only
      radius = [0, 0, 4, 4];
    } else if (isTop) {
      // Top of stack: round top corners only
      radius = [4, 4, 0, 0];
    } else {
      // Middle of stack: no rounding
      radius = [0, 0, 0, 0];
    }

    return <Rectangle {...props} radius={radius} />;
  };
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
              stackId={bar.stackId}
              shape={createStackAwareShape(bar.key, bar.stackId, bars, data)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
