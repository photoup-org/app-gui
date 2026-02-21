import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

/**
 * Enhanced session retrieval helper that:
 * 1. Safely catches JWE decryption errors (e.g., if AUTH0_SECRET changes) and forces a clear/logout.
 * 2. Injects custom namespace claims (roles, org_name) directly into the user object.
 * 
 * @param request Optional NextRequest, required when calling from Middleware.
 * @returns The session object with populated custom claims, or null.
 */
export async function getAppSession(request?: NextRequest) {
    let session;
    try {
        if (request) {
            session = await auth0.getSession(request);
        } else {
            session = await auth0.getSession();
        }
    } catch (error) {
        console.warn("[Session Helper] Failed to get session (likely JWE decryption error):", error);

        if (request) {
            // In Middleware, throw the error so the parent route can explicitly return a NextResponse
            throw error;
        } else {
            // In Server Components, redirect() cleanly aborts rendering
            redirect("/auth/logout");
        }
    }

    if (session?.user) {
        const namespace = process.env.AUTH0_NAMESPACE || "https://app.photoup.pt";

        // Inject Roles
        if (session.user[`${namespace}/roles`]) {
            session.user.roles = session.user[`${namespace}/roles`] as string[];
        }

        // Inject Organization
        const orgSlug = session.user[`${namespace}/org_name`] ||
            session.user.org_name ||
            session.user.org_slug;
        if (orgSlug) {
            session.user.org_slug = orgSlug;
            // Also alias org_name for convenience if needed by other parts of the app
            session.user.org_name = orgSlug;
        }
    }

    return session;
}
