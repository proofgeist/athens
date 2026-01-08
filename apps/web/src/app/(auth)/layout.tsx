import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="relative min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/30">
			{/* Subtle pattern overlay */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(148,163,184)_1px,transparent_0)] bg-[length:24px_24px] opacity-[0.02] pointer-events-none" />
			
			{/* Minimal header with just theme toggle */}
			<div className="relative flex justify-end p-4 z-10">
				<ModeToggle />
			</div>

			{/* Centered content */}
			<div className="relative flex-1 flex items-center justify-center px-4 z-10">
				{children}
			</div>

			{/* Footer */}
			<div className="relative p-4 text-center text-sm text-muted-foreground z-10">
				© {new Date().getFullYear()} Athens
			</div>
		</div>
	);
}








