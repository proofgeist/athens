import { auth } from "@athens/auth";
import { NextResponse, type NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/login"];

export default async function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// Check if this is a public route
	const isPublicRoute = publicRoutes.some((route) =>
		pathname.startsWith(route),
	);

	// Get session
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	// Redirect unauthenticated users to login (unless on public route)
	if (!isPublicRoute && !session?.user) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Redirect authenticated users away from login to projects
	if (isPublicRoute && session?.user) {
		return NextResponse.redirect(new URL("/projects", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Match all paths except static files and API routes
		"/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)",
	],
};

