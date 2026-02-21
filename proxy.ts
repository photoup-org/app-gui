import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getAppSession } from "@/lib/session";

const AUTH_ROUTES_PREFIX = "/auth";
const DASHBOARD_ROUTES_PREFIX = "/dashboard";
const MARKETING_ROOT = "/";

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Skip middleware logic for Auth0 routes to prevent interference
    // Auth0 v4 defaults to /auth/* routes, so we skip those.
    if (pathname.startsWith(AUTH_ROUTES_PREFIX)) {
        return await auth0.middleware(request);
    }

    // 2. Safely retrieve session using centralized helper
    let session;
    try {
        session = await getAppSession(request);
    } catch (error) {
        // If decryption failed, getAppSession throws in middleware context
        const logoutUrl = request.nextUrl.clone();
        logoutUrl.pathname = `${AUTH_ROUTES_PREFIX}/logout`;
        return NextResponse.redirect(logoutUrl);
    }

    // 3. Mandatory Organization Check (only applicable for logged-in users)
    if (session?.user) {
        if (!session.user.org_slug) {
            console.warn(`[Proxy] User ${session.user.sub} logged in but has no associated organization. Forcing logout.`);
            // Force logout if no organization is found
            const logoutUrl = request.nextUrl.clone();
            logoutUrl.pathname = `${AUTH_ROUTES_PREFIX}/logout`;
            return NextResponse.redirect(logoutUrl);
        }
    }

    // 4. Protect all /dashboard/* routes
    if (pathname.startsWith(DASHBOARD_ROUTES_PREFIX)) {
        if (!session) {
            console.log(`[Proxy] Blocked unauthenticated access to ${pathname}. Redirecting to login.`);
            const loginUrl = request.nextUrl.clone();
            loginUrl.pathname = `${AUTH_ROUTES_PREFIX}/login`;
            loginUrl.searchParams.set("returnTo", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 5. Redirect authenticated users from marketing root (/) to /dashboard
    if (pathname === MARKETING_ROOT) {
        if (session) {
            const dashboardUrl = request.nextUrl.clone();
            dashboardUrl.pathname = DASHBOARD_ROUTES_PREFIX;
            return NextResponse.redirect(dashboardUrl);
        }
    }

    // 6. Final delegation to Auth0
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