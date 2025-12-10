import { redirect } from "next/navigation";
import Dashboard from "./dashboard";
import { headers } from "next/headers";
import { auth } from "@athens/auth";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			{/* Page header */}
			<div className="flex items-center justify-between py-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back, {session.user.name}
					</p>
				</div>
			</div>

			{/* Stats cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-xl border bg-card p-6">
					<div className="flex flex-row items-center justify-between space-y-0 pb-2">
						<h3 className="text-sm font-medium">Total Projects</h3>
					</div>
					<div className="text-2xl font-bold">12</div>
					<p className="text-xs text-muted-foreground">+2 from last month</p>
				</div>
				<div className="rounded-xl border bg-card p-6">
					<div className="flex flex-row items-center justify-between space-y-0 pb-2">
						<h3 className="text-sm font-medium">RAPTOR Completion</h3>
					</div>
					<div className="text-2xl font-bold">78%</div>
					<p className="text-xs text-muted-foreground">+5% from last week</p>
				</div>
				<div className="rounded-xl border bg-card p-6">
					<div className="flex flex-row items-center justify-between space-y-0 pb-2">
						<h3 className="text-sm font-medium">Open Action Items</h3>
					</div>
					<div className="text-2xl font-bold">24</div>
					<p className="text-xs text-muted-foreground">-8 from last week</p>
				</div>
				<div className="rounded-xl border bg-card p-6">
					<div className="flex flex-row items-center justify-between space-y-0 pb-2">
						<h3 className="text-sm font-medium">High Priority</h3>
					</div>
					<div className="text-2xl font-bold text-destructive">5</div>
					<p className="text-xs text-muted-foreground">Requires attention</p>
				</div>
			</div>

			{/* Main content area */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<div className="col-span-4 rounded-xl border bg-card">
					<div className="p-6">
						<h3 className="font-semibold">Recent Activity</h3>
						<p className="text-sm text-muted-foreground">
							Your project updates from the past week
						</p>
					</div>
					<div className="p-6 pt-0">
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<div key={i} className="flex items-center gap-4">
									<div className="h-2 w-2 rounded-full bg-primary" />
									<div className="flex-1">
										<p className="text-sm font-medium">Project {i} Updated</p>
										<p className="text-xs text-muted-foreground">
											Checklist item completed
										</p>
									</div>
									<span className="text-xs text-muted-foreground">
										{i}h ago
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="col-span-3 rounded-xl border bg-card">
					<div className="p-6">
						<h3 className="font-semibold">Action Items</h3>
						<p className="text-sm text-muted-foreground">
							Items requiring your attention
						</p>
					</div>
					<div className="p-6 pt-0">
						<Dashboard session={session} />
					</div>
				</div>
			</div>
		</div>
	);
}
