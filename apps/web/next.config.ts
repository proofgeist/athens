import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	// Temporarily disabled - causes Turbopack panics with recharts
	// reactCompiler: true,
	// Ensure monorepo packages are transpiled
	transpilePackages: ["@athens/api", "@athens/auth"],
};

export default nextConfig;
