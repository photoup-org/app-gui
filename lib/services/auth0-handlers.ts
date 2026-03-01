import prisma from "@/lib/prisma";
import * as departmentService from '@/lib/repositories/department';

export async function handlePostLoginSync(email: string, auth0UserId: string, auth0OrgId: string) {
    if (!email || !auth0UserId || !auth0OrgId) {
        throw new Error("Missing required fields");
    }

    // 1. Look up the corresponding department
    const department = await departmentService.findDepartmentByAuth0OrgId(auth0OrgId);

    if (!department) {
        console.error(`[Auth0 Webhook] Department not found for auth0OrgId: ${auth0OrgId}`);
        throw new Error("Department not found"); // Will map to 404 in caller
    }

    const primaryDepartmentId = department.id;

    // 2. Upsert the User
    await prisma.user.upsert({
        where: { email },
        update: {
            // The Admin from Stripe is found! Link their new Auth0 ID.
            auth0UserId
        },
        create: {
            // An invited employee logging in for the first time. Create them.
            email,
            auth0UserId,
            departmentId: primaryDepartmentId,
            role: 'VIEWER' // Default employee role
        }
    });

    console.log(`[Auth0 Webhook] Successfully synced user ${email} to department ${primaryDepartmentId}`);
}
