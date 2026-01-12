"use client";

interface CategoryProgressBarProps {
  label: string;
  value: number; // 0-1 or 0-100
  completed: number;
  total: number;
  itemLabel?: string; // "Items", "Tests", "Docs"
}

export function CategoryProgressBar({ 
  label, 
  value, 
  completed, 
  total,
  itemLabel = "Items"
}: CategoryProgressBarProps) {
  // Convert decimal (0-1) to percentage (0-100) if needed
  const percentageValue = value <= 1 ? value * 100 : value;
  const percentage = Math.round(percentageValue);
  
  // Calculate remaining
  const remaining = total - completed;
  
  // Color logic matching CompletionBadge and CircularProgress
  let colorClass = "bg-muted";
  if (percentage >= 90) {
    colorClass = "bg-success";
  } else if (percentage >= 70) {
    colorClass = "bg-info";
  } else if (percentage >= 50) {
    colorClass = "bg-warning";
  } else if (percentage > 0) {
    colorClass = "bg-highlight";
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] font-bold uppercase tracking-widest">
          {label}
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
          {percentage}%
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Remaining Count */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="font-mono tabular-nums">
          {remaining} {itemLabel} Remaining
        </span>
        <span className="font-mono tabular-nums text-muted-foreground/70">
          {completed} of {total}
        </span>
      </div>
    </div>
  );
}


