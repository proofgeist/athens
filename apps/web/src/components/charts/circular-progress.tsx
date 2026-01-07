"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface CircularProgressProps {
  value: number;
  label: string;
  size?: "sm" | "md" | "lg";
  labelInside?: boolean;
}

export function CircularProgress({ value, label, size = "md", labelInside = false }: CircularProgressProps) {
  // Convert decimal (0-1) to percentage (0-100) if needed
  const percentageValue = value <= 1 ? value * 100 : value;
  const percentage = Math.round(percentageValue);
  
  // Color logic matching CompletionBadge
  let color = "hsl(var(--muted))";
  if (percentage >= 90) {
    color = "hsl(142, 76%, 36%)"; // green
  } else if (percentage >= 70) {
    color = "hsl(221, 83%, 53%)"; // blue
  } else if (percentage >= 50) {
    color = "hsl(48, 96%, 53%)"; // yellow
  } else if (percentage > 0) {
    color = "hsl(25, 95%, 53%)"; // orange
  }

  const data = [
    { name: "completed", value: percentage },
    { name: "remaining", value: 100 - percentage },
  ];

  const chartSize = size === "sm" ? 110 : size === "lg" ? 200 : 160;
  const innerRadius = size === "sm" ? 38 : size === "lg" ? 75 : 60;
  const outerRadius = size === "sm" ? 55 : size === "lg" ? 100 : 80;
  const percentageFontSize = size === "sm" ? "text-xl" : "text-2xl";
  const labelFontSize = size === "sm" ? "text-[6.5px]" : "text-[10px]";

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative" style={{ width: chartSize, height: chartSize }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
            >
              <Cell fill={color} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
          <span className={`${percentageFontSize} font-bold leading-none`}>{percentage}%</span>
          {labelInside && (
            <span className={`${labelFontSize} font-semibold text-muted-foreground uppercase tracking-wider text-center leading-[1.1] mt-1 whitespace-pre-line max-w-full`}>
              {label}
            </span>
          )}
        </div>
      </div>
      {!labelInside && (
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}







