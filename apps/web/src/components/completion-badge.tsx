export function CompletionBadge({ value }: { value: number | null | undefined }) {
	// Convert decimal (0-1) to percentage (0-100) if needed
	const percentageValue = value != null ? (value <= 1 ? value * 100 : value) : 0;
	const percentage = Math.round(percentageValue);
	
	// Color coding based on completion percentage using semantic colors
	let colorClass = "bg-muted text-muted-foreground";
	if (percentage >= 90) {
		colorClass = "bg-success/10 text-success border border-success/20";
	} else if (percentage >= 70) {
		colorClass = "bg-info/10 text-info border border-info/20";
	} else if (percentage >= 50) {
		colorClass = "bg-warning/10 text-warning border border-warning/20";
	} else if (percentage > 0) {
		colorClass = "bg-highlight/10 text-highlight border border-highlight/20";
	}

	return (
		<span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-medium tabular-nums ${colorClass}`}>
			{percentage}%
		</span>
	);
}

