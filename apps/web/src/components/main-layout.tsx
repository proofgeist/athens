"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

const ROUTE_TITLES: Record<string, string> = {
	"/dashboard": "Dashboard",
	"/projects": "Projects",
	"/action-items": "Action Items",
	"/routes": "API Routes Tester",
};

function getPageTitle(pathname: string): string {
	// Check exact matches first
	if (ROUTE_TITLES[pathname]) {
		return ROUTE_TITLES[pathname];
	}

	// Handle dynamic routes
	if (pathname.startsWith("/projects/") && pathname !== "/projects") {
		return "Project Details";
	}
	if (pathname.startsWith("/action-items/") && pathname !== "/action-items") {
		return "Action Item Details";
	}

	// Default fallback
	return "";
}

export function MainLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const pageTitle = getPageTitle(pathname);

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-gradient-to-r from-card via-card to-secondary/20 px-4 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex flex-1 items-center gap-2">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4"
						/>
						{pageTitle && (
							<span className="text-sm font-medium">{pageTitle}</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						<ModeToggle />
					</div>
				</header>
				<main className="flex-1 overflow-auto">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}

