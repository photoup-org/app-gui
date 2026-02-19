import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Skip middleware logic for Auth0 routes to prevent interference
    // Auth0 v4 defaults to /auth/* routes, so we skip those.
    if (pathname.startsWith("/auth")) {
        return await auth0.middleware(request);
    }

    const session = await auth0.getSession(request);
    // 2. Mandatory Organization Check
    if (session?.user) {
        const orgSlug = session.user[`${process.env.AUTH0_NAMESPACE}/org_name`] ||
            session.user.org_name ||
            session.user.org_slug;
        if (!orgSlug) {
            // Force logout if no organization is found
            return NextResponse.redirect(new URL("/auth/logout", request.url));
        }
    }

    // 3. Protect all /dashboard/* routes
    if (pathname.startsWith("/dashboard")) {
        if (!session) {
            return NextResponse.redirect(new URL("/auth/login?returnTo=" + pathname, request.url));
        }
    }

    // 4. Redirect authenticated users from marketing root (/) to /dashboard
    if (pathname === "/") {
        if (session) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // 5. Final delegation to Auth0
    return await auth0.middleware(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes, handled inside proxy but good to exclude non-auth apis if needed)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};