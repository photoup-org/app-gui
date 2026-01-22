import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function proxy(request: NextRequest) {
    const response = await auth0.middleware(request);

    const session = await auth0.getSession(request);

    // Skip middleware logic for auth routes to prevent redirect loops
    // This is critical because redirecting to /auth/logout while the session is still active
    // would trigger this middleware again, causing an infinite loop.
    if (request.nextUrl.pathname.startsWith("/auth/") || request.nextUrl.pathname.startsWith("/api/auth/")) {
        return response;
    }

    if (session?.user) {
        // Enforce Mandatory Organization
        // If the user does not have an organization, they should not be logged in.
        const orgSlug = session.user["https://iot-monitor.app/org_name"] || session.user.org_name || session.user.org_slug;

        if (!orgSlug) {
            // Force logout if no organization is found
            return NextResponse.redirect(new URL("/auth/logout", request.url));
        }

        const url = request.nextUrl.clone();
        const hostname = request.headers.get("host") || "";

        // Parse APP_BASE_URL to derive production config
        // Default to localhost for safety if env not set
        const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
        let baseHostname = "localhost";
        let basePort = "3000";

        try {
            const parsedBase = new URL(appBaseUrl);
            baseHostname = parsedBase.hostname;
            basePort = parsedBase.port || (parsedBase.protocol === "https:" ? "443" : "80");
        } catch (error) {
            console.error("Critical Error: Failed to parse APP_BASE_URL", appBaseUrl, error);
            // Fallback is already set to localhost:3000, but in production, this should be addressed.
        }

        // Check if current hostname is the base domain.
        // We compare against baseHostname and baseHostname:basePort to handle both cases.
        const isBaseDomain =
            hostname === baseHostname ||
            hostname === `${baseHostname}:${basePort}`;

        // If user has an organization and is on the base domain, redirect to their subdomain
        if (isBaseDomain) {
            // Logic to construct the new hostname:
            // 1. If base starts with 'app.', replace 'app' with orgSlug (e.g., app.domain.com -> org.domain.com)
            // 2. Otherwise, prepend orgSlug (e.g., domain.com -> org.domain.com)
            // 3. Special handling might be needed for localhost to avoid 'org.localhost' if not supported, 
            //    but we will follow standard subdomain logic here.

            const parts = baseHostname.split('.');
            if (parts[0] === 'app') {
                parts[0] = orgSlug;
            } else {
                // Prepend if it doesn't start with 'app'
                // But avoid prepending if it's just 'localhost' to prevent resolution issues unless intended
                if (baseHostname !== 'localhost') {
                    parts.unshift(orgSlug);
                } else {
                    // For localhost, we might want to test subdomains like `org.localhost` 
                    // (which works on some systems/browsers or requires /etc/hosts).
                    // We'll proceed with replacement/prepend strategy for consistency.
                    parts[0] = orgSlug; // treating localhost as the token to replace/prepend? 
                    // Actually, for localhost, 'app.localhost' is often used as base. 
                    // If base is just 'localhost', we probably want 'org.localhost'.
                    parts.unshift(orgSlug);
                }
            }
            const newHost = parts.join('.');

            // Construct redirect URL
            const targetUrl = new URL(url);
            targetUrl.hostname = newHost;
            targetUrl.port = basePort;
            targetUrl.protocol = request.headers.get("x-forwarded-proto") || "http";

            return NextResponse.redirect(targetUrl);
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};