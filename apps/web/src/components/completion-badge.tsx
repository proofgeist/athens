export function CompletionBadge({ value }: { value: number | null | undefined }) {
	// Convert decimal (0-1) to percentage (0-100) if needed
	const percentageValue = value != null ? (value <= 1 ? value * 100 : value) : 0;
	const percentage = Math.round(percentageValue);
	
	// Color coding based on completion percentage
	let colorClass = "bg-muted text-muted-foreground";
	if (percentage >= 90) {
		colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
	} else if (percentage >= 70) {
		colorClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
	} else if (percentage >= 50) {
		colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
	} else if (percentage > 0) {
		colorClass = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
	}

	return (
		<span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}>
			{percentage}%
		</span>
	);
}

