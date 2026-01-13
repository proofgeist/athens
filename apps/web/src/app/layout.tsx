import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";

const dmSans = DM_Sans({
	variable: "--font-dm-sans",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
	adjustFontFallback: true,
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
	weight: ["400", "500"],
	display: "swap",
	adjustFontFallback: true,
});

export const metadata: Metadata = {
	title: "Athens Group Raptor Dashboard",
	description: "RAPTOR Inspection Dashboard",
	icons: {
		icon: [
			{ url: "/favicon/favicon.png", sizes: "any" },
		],
		apple: [
			{ url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className="overflow-x-hidden">
			<body
				className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased overflow-x-hidden`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
