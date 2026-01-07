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
  
  // Color logic matching CompletionBadge - using OKLCH color values
  let color = "oklch(0.95 0.01 240)"; // muted
  if (percentage >= 90) {
    color = "oklch(0.55 0.16 155)"; // success - green
  } else if (percentage >= 70) {
    color = "oklch(0.70 0.16 210)"; // info - cyan
  } else if (percentage >= 50) {
    color = "oklch(0.75 0.15 75)"; // warning - yellow
  } else if (percentage > 0) {
    color = "oklch(0.65 0.18 35)"; // highlight - orange
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
              <Cell fill="oklch(0.95 0.01 240)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
          <span className={`${percentageFontSize} font-mono font-bold leading-none tabular-nums`}>{percentage}%</span>
          {labelInside && (
            <span className={`${labelFontSize} font-mono font-semibold text-muted-foreground uppercase tracking-wider text-center leading-[1.1] mt-1 whitespace-pre-line max-w-full`}>
              {label}
            </span>
          )}
        </div>
      </div>
      {!labelInside && (
        <span className="text-sm font-mono font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}







