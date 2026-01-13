"use client";

import Image from "next/image";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function TeamSwitcher() {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<div className="flex aspect-square size-8 items-center justify-center rounded-xs overflow-hidden">
						<Image
							src="/favicon/athens-logo.png"
							alt="Athens Group Logo"
							width={32}
							height={32}
							className="h-full w-full object-contain"
							unoptimized
						/>
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">Athens Group</span>
						<span className="truncate text-xs text-muted-foreground">
							RAPTOR Dashboard
						</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}








