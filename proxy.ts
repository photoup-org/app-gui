import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import { getAppSession } from "@/lib/auth/session";

const AUTH_ROUTES_PREFIX = "/auth";
const MARKETING_ROOT = "/";
const CUSTOM_LOGIN_PAGE = "/login";
const NO_ORG_FALLBACK = "/no-workspace";
const PROTECTED_ROUTES = [
    "/dashboard",
    "/settings",
    "/devices",
];
const NAMESPACE = "https://app.photoup.pt";


function clearSessionAndRedirect(request: NextRequest, redirectTo: string = MARKETING_ROOT) {
    const targetUrl = new URL(redirectTo, request.url);
    const isAlreadyOnTarget = request.nextUrl.pathname === targetUrl.pathname;

    let response = isAlreadyOnTarget ? NextResponse.next() : NextResponse.redirect(targetUrl);

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
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = CUSTOM_LOGIN_PAGE;

    let session;
    try {
        session = await getAppSession(request);
    } catch (error) {
        console.warn("[Proxy] Session decryption failed. Manually clearing cookies and redirecting to root.");
        return clearSessionAndRedirect(request);
    }


    if (pathname.startsWith(AUTH_ROUTES_PREFIX)) {
        if (pathname === `${AUTH_ROUTES_PREFIX}/login`) {
            const searchParams = request.nextUrl.searchParams;
            const organization = searchParams.get("organization");
            const invitation = searchParams.get("invitation");
            const screen_hint = searchParams.get("screen_hint");
            const returnTo = searchParams.get("returnTo");
            if (organization || invitation || screen_hint) {
                return await auth0.startInteractiveLogin({
                    returnTo: returnTo || "/dashboard",
                    authorizationParameters: {
                        organization: organization || undefined,
                        invitation: invitation || undefined,
                        screen_hint: screen_hint || undefined,
                    }
                });
            }
        }

        return await auth0.middleware(request);
    }

    if (isProtectedRoute) {

        if (!session) {
            console.log(`[Proxy] Blocked unauthenticated access. Redirecting to custom login.`);
            loginUrl.searchParams.set("returnTo", pathname);
            return NextResponse.redirect(loginUrl);
        } else if (!session.user.org_id) {
            console.warn(`[Proxy] User ${session.user.sub} accessed dashboard without org_id. Redirecting to fallback.`);
            const fallbackUrl = request.nextUrl.clone();
            fallbackUrl.pathname = NO_ORG_FALLBACK;
            return NextResponse.redirect(fallbackUrl);
        }
    }

    // if (pathname === MARKETING_ROOT) {
    //     if (session) {
    //         const target = session.user.org_id ? DASHBOARD_ROUTES_PREFIX : NO_ORG_FALLBACK;
    //         const dashboardUrl = request.nextUrl.clone();
    //         dashboardUrl.pathname = target;
    //         return NextResponse.redirect(dashboardUrl);
    //     }
    // }

    return await auth0.middleware(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/webhooks (Stripe and Auth0 webhooks)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)",
    ],
};