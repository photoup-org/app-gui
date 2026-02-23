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

        // 2. Look up the corresponding department
        const department = await prisma.department.findUnique({
            where: { auth0OrgId }
        });

        if (!department) {
            console.error(`[Auth0 Webhook] Department not found for auth0OrgId: ${auth0OrgId}`);
            return NextResponse.json({ error: "Department not found" }, { status: 404 });
        }

        const primaryDepartmentId = department.id;

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
