import prisma from "@/lib/prisma";
import * as departmentService from '@/lib/repositories/department';
import { createOrg, enableOrgConnection, generateAuth0InviteTicket } from "../auth/auth0-management";
import { sendInvitationEmail } from "./email";

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

    // 2. Synchronize the User
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        // The user was provisioned via Stripe webhook! Link their Auth0 ID.
        await prisma.user.update({
            where: { email },
            data: { auth0UserId }
        });
        console.log(`[Auth0 Webhook] 🟢 SUCCESS: Synced existing user ${email} and linked auth0UserId: ${auth0UserId}`);
    } else {
        // Fallback: an invited employee logging in for the first time
        // (or a rogue login bypassing Stripe).
        console.error(`[CRITICAL ALERT] User bypassed Stripe provisioning! Creating fallback user for email: ${email}`);

        await prisma.user.create({
            data: {
                email,
                auth0UserId,
                departmentId: primaryDepartmentId,
                role: 'VIEWER' // Default employee role
            }
        });
        console.log(`[Auth0 Webhook] Created and synced fallback user ${email} to department ${primaryDepartmentId}`);
    }
}

export async function setupAuth0AndInvite(orgName: string, departmentId: string, userEmail: string) {
    try {
        const auth0OrgSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + `-${Date.now().toString().slice(-6)}`;
        console.log(`[Webhook] Creating Auth0 Organization: ${auth0OrgSlug}`);

        const auth0Org = await createOrg(auth0OrgSlug, orgName);
        const auth0OrgId = auth0Org.id as string;

        // Update Department with real Auth0 Org ID
        await departmentService.updateDepartmentAuth0OrgId(departmentId, auth0OrgId);
        await enableOrgConnection(auth0OrgId);

        console.log(`[Webhook] Generating Auth0 Invite for ${userEmail} (Org: ${auth0OrgId})`);
        const ticket = await generateAuth0InviteTicket(auth0OrgId, userEmail);

        if (ticket) {
            const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const customLink = `${domain}/auth/login?invitation=${ticket}&organization=${auth0OrgId}&screen_hint=signup`;
            await sendInvitationEmail(userEmail, customLink);
        }
    } catch (error: any) {
        console.error(`[Webhook] Post-Transaction Error (Auth0/Email) for ${userEmail}:`, error);
    }
}
