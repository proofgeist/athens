"use client";

import { useState } from "react";
import {
	ActionItemsSummary,
	ActionItemsSummaryHeader,
} from "./dashboard";

export function ActionItemsSummaryWrapper() {
	const [showClosed, setShowClosed] = useState(false);

	return (
		<>
			<div className="p-6">
				<ActionItemsSummaryHeader
					showClosed={showClosed}
					setShowClosed={setShowClosed}
				/>
			</div>
			<div className="p-6 pt-0 flex-1 overflow-hidden">
				<ActionItemsSummary
					showClosed={showClosed}
					setShowClosed={setShowClosed}
				/>
			</div>
		</>
	);
}

