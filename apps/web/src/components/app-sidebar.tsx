"use client";

import * as React from "react";
import {
	LayoutDashboard,
	FolderKanban,
	ClipboardList,
	BarChart3,
	Settings,
	HelpCircle,
	Code2,
	type LucideIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

type NavItem = {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: {
		title: string;
		url: string;
	}[];
};

const navItems: NavItem[] = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
		isActive: true,
	},
	{
		title: "Projects",
		url: "/projects",
		icon: FolderKanban,
		items: [
			{ title: "All Projects", url: "/projects" },
			{ title: "Active", url: "/projects?status=active" },
			{ title: "Completed", url: "/projects?status=completed" },
		],
	},
	{
		title: "Inspections",
		url: "/inspections",
		icon: ClipboardList,
		items: [
			{ title: "RAPTOR Checklist", url: "/inspections/raptor" },
			{ title: "System Integration", url: "/inspections/sit" },
			{ title: "Document Verification", url: "/inspections/docs" },
		],
	},
	{
		title: "Reports",
		url: "/reports",
		icon: BarChart3,
		items: [
			{ title: "Overview", url: "/reports" },
			{ title: "Action Items", url: "/reports/action-items" },
			{ title: "Progress", url: "/reports/progress" },
		],
	},
	{
		title: "API Routes",
		url: "/routes" as "/",
		icon: Code2,
	},
	{
		title: "Settings",
		url: "/settings",
		icon: Settings,
	},
	{
		title: "Help",
		url: "/help",
		icon: HelpCircle,
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = authClient.useSession();

	const user = session?.user
		? {
				name: session.user.name || "User",
				email: session.user.email || "",
				avatar: session.user.image || "",
			}
		: {
				name: "Loading...",
				email: "",
				avatar: "",
			};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navItems} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

