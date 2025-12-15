import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	// Temporarily disabled - causes Turbopack panics with recharts
	// reactCompiler: true,
};

export default nextConfig;
