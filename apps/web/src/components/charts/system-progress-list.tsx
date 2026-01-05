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
    if (progress >= 90) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.system} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.system}</span>
              <span className="text-muted-foreground">{item.progress}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getProgressColor(item.progress)}`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}







