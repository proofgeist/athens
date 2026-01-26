"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Rectangle } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";

interface BarConfig {
  key: string;
  color: string;
  label: string;
  stackId?: string;
}

interface HorizontalGroupedBarChartProps {
  data: Array<{
    name: string;
    [key: string]: string | number;
  }>;
  bars: BarConfig[];
}

// Custom shape component for horizontal bars that dynamically determines corner rounding based on actual data
function createHorizontalStackAwareShape(
  barKey: string,
  stackId: string | undefined,
  allBars: BarConfig[],
  chartData: HorizontalGroupedBarChartProps["data"]
) {
  // For non-stacked bars, return a simple rectangle with all corners rounded
  if (!stackId) {
    return (props: any) => <Rectangle {...props} radius={4} />;
  }

  // Get all bars in this stack, in render order (first = left, last = right)
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
    const isLeft = dataBarIndex === 0;
    const isRight = dataBarIndex === barsWithData.length - 1;
    const isOnly = barsWithData.length === 1;

    // Determine radius based on actual position in the rendered stack
    // For horizontal bars: [topLeft, topRight, bottomRight, bottomLeft]
    // Left end: round left corners (topLeft and bottomLeft)
    // Right end: round right corners (topRight and bottomRight)
    let radius: [number, number, number, number] | number;

    if (isOnly) {
      // Only bar with data: round all corners
      radius = 4;
    } else if (isLeft && isRight) {
      // Shouldn't happen, but handle edge case
      radius = 4;
    } else if (isLeft) {
      // Left of stack: round left corners only [topLeft, topRight, bottomRight, bottomLeft]
      radius = [4, 0, 0, 4];
    } else if (isRight) {
      // Right of stack: round right corners only
      radius = [0, 4, 4, 0];
    } else {
      // Middle of stack: no rounding
      radius = [0, 0, 0, 0];
    }

    return <Rectangle {...props} radius={radius} />;
  };
}

export function HorizontalGroupedBarChart({ data, bars }: HorizontalGroupedBarChartProps) {
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
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              fill={bar.color}
              stackId={bar.stackId}
              shape={createHorizontalStackAwareShape(bar.key, bar.stackId, bars, data)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
