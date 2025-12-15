import { Suspense } from "react";
import { RoutesTester } from "./routes-tester";

export default function RoutesPage() {
	return (
		<div className="container mx-auto py-8 px-4">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">API Routes Tester</h1>
					<p className="text-muted-foreground mt-2">
						Test oRPC procedures with custom inputs and view formatted JSON responses
					</p>
				</div>

				<Suspense fallback={<div>Loading...</div>}>
					<RoutesTester />
				</Suspense>
			</div>
		</div>
	);
}


