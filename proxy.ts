import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getAppSession } from "@/lib/session";

const AUTH_ROUTES_PREFIX = "/auth";
const DASHBOARD_ROUTES_PREFIX = "/dashboard";
const MARKETING_ROOT = "/";

/**
 * Helper to manually wipe the Auth0 appSession cookies and redirect.
 * Useful when the session cookie is corrupted (e.g. AUTH0_SECRET changed)
 * and the Auth0 SDK itself fails to process the request over /auth/logout.
 */
function clearSessionAndRedirect(request: NextRequest, redirectTo: string = MARKETING_ROOT) {
    // If we're already trying to go to the redirect target (like MARKETING_ROOT),
    // and we still have a bad cookie, we need to strip the cookie and ALLOW the request 
    // to pass through to Next.js natively, otherwise we get ERR_TOO_MANY_REDIRECTS.
    const targetUrl = new URL(redirectTo, request.url);
    const isAlreadyOnTarget = request.nextUrl.pathname === targetUrl.pathname;

    let response;
    if (isAlreadyOnTarget) {
        response = NextResponse.next();
    } else {
        response = NextResponse.redirect(targetUrl);
    }

    // Explicitly delete all known Auth0 session cookies from the upcoming response
    // and forcefully remove them from the incoming request so downstream code doesn't see them
    request.cookies.getAll().forEach(cookie => {
        if (cookie.name.startsWith("appSession") || cookie.name.startsWith("__session") || cookie.name.startsWith("__txn")) {
            response.cookies.delete(cookie.name);
            request.cookies.delete(cookie.name);
        }
    });

    return response;
}

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Safely retrieve session using centralized helper first.
    // If the cookie is corrupted, this will THROW.
    let session;
    try {
        session = await getAppSession(request);
    } catch (error) {
        console.warn("[Proxy] Session decryption failed. Manually clearing cookies and redirecting to root.");
        return clearSessionAndRedirect(request);
    }

    // 2. Auth0 Routes (/auth/*)
    if (pathname.startsWith(AUTH_ROUTES_PREFIX)) {
        return await auth0.middleware(request);
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