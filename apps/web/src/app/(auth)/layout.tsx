import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
			{/* Minimal header with just theme toggle */}
			<div className="flex justify-end p-4">
				<ModeToggle />
			</div>

			{/* Centered content */}
			<div className="flex-1 flex items-center justify-center px-4">
				{children}
			</div>

			{/* Footer */}
			<div className="p-4 text-center text-sm text-muted-foreground">
				© {new Date().getFullYear()} Athens
			</div>
		</div>
	);
}

