import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    // 1. Authenticate the Webhook
    const authHeader = req.headers.get("authorization");
    const secret = process.env.AUTH0_WEBHOOK_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { email, auth0UserId, auth0OrgId } = body;

        if (!email || !auth0UserId || !auth0OrgId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Look up the corresponding organization and its departments
        const organization = await prisma.organization.findUnique({
            where: { auth0OrgId },
            include: { departments: true }
        });

        if (!organization) {
            console.error(`[Auth0 Webhook] Organization not found for auth0OrgId: ${auth0OrgId}`);
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        if (organization.departments.length === 0) {
            console.error(`[Auth0 Webhook] No departments found for organization: ${organization.id}`);
            return NextResponse.json({ error: "No departments found" }, { status: 400 });
        }

        // Use the primary department (or you could enhance logic to find a specific one later)
        const primaryDepartmentId = organization.departments[0].id;

        // 3. Upsert the User
        await prisma.user.upsert({
            where: { auth0UserId },
            update: {
                email // Update email in case it changed in Auth0
            },
            create: {
                email,
                auth0UserId,
                departmentId: primaryDepartmentId,
                role: 'ADMIN' // Default new organizational joined users to ADMIN per requirements
            }
        });

        console.log(`[Auth0 Webhook] Successfully synced user ${email} to department ${primaryDepartmentId}`);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("[Auth0 Webhook] Error processing post-login sync:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
