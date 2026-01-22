import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function proxy(request: NextRequest) {
    const response = await auth0.middleware(request);

    // If the user is authenticated, we can proceed with organization routing logic
    // Note: auth0.middleware returns a response. To inspect the session, we might need a different approach
    // or use getSession if available in this context.
    // However, in the Next.js App Router with Auth0, using `auth0.getSession` inside middleware 
    // is the standard way to access user data.

    const session = await auth0.getSession(request);

    if (session?.user) {
        const url = request.nextUrl.clone();
        const hostname = request.headers.get("host") || "";

        // Define base domain
        const baseDomain = "app.photoup.pt"; // In production
        // For local testing, we might need logic to handle 'localhost' or mapped hosts
        const isBaseDomain = hostname === baseDomain || hostname === "localhost:3000";

        // Check if user has an organization
        // Assuming org_id or similar is available. 
        // We usually need the organization SLUG to redirect to the subdomain.
        // If the org slug is not in the session, we might need to fetch it or ensure it's added.
        // Let's assume 'org_name' claim exists or we use 'org_id' if that's the subdomain.
        const orgSlug = session.user.org_name || session.user.org_slug;

        if (isBaseDomain && orgSlug) {
            // Redirect to organization subdomain
            // Construct new URL
            // If local, we might need a different base mechanism, but let's implement for the requested domain

            // If we are on localhost, we can't easily subdomaining without hosts file.
            // Assuming hosts file converts acme.photoup.pt -> 127.0.0.1

            const proto = request.headers.get("x-forwarded-proto") || "http";
            const port = "3000"; // Hardcoded for dev, should be dynamic in prod

            // Production-like URL construction
            const newHost = `${orgSlug}.photoup.pt`; // Or logic to replace 'app' with orgSlug

            // If we are strictly mapping app.photoup.pt -> acme.photoup.pt
            const targetUrl = new URL(url);
            targetUrl.hostname = newHost;
            targetUrl.port = port; // Keep port for local dev
            targetUrl.protocol = proto;

            return NextResponse.redirect(targetUrl);
        }
    }

    return response;
    // return await auth0.middleware(request);
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