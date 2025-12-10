import { auth } from "@athens/auth";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login"];

export default async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// Check if this is a protected route
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route),
	);

	// Check if this is an auth route (login/signup)
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

	// Skip middleware for non-protected/non-auth routes
	if (!isProtectedRoute && !isAuthRoute) {
		return NextResponse.next();
	}

	// Get session using request headers (Edge Runtime compatible)
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	// Redirect unauthenticated users from protected routes to login
	if (isProtectedRoute && !session?.user) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Redirect authenticated users from auth routes to dashboard
	if (isAuthRoute && session?.user) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Match all paths except static files and API routes
		"/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)",
	],
};

