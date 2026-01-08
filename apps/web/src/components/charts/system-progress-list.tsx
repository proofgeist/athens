"use client";

interface SystemProgressListProps {
  title: string;
  items: Array<{
    system: string;
    progress: number;
  }>;
}

export function SystemProgressList({ title, items }: SystemProgressListProps) {
  const getProgressColor = (progress: number) => {
    // Match the color scheme from CircularProgress and CategoryProgressBar
    if (progress >= 90) return "bg-success";
    if (progress >= 70) return "bg-info";
    if (progress >= 50) return "bg-warning";
    return "bg-highlight";
  };

  // Convert decimal (0-1) to percentage (0-100) if needed
  const normalizeProgress = (progress: number) => {
    return progress <= 1 ? progress * 100 : progress;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item) => {
          const progress = normalizeProgress(item.progress);
          return (
            <div key={item.system} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.system}</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getProgressColor(progress)}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}







