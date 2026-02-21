import prisma from '@/lib/prisma';

/**
 * Synchronizes the Auth0 session user with the Prisma database on first login.
 * This should be called from the Next.js Middleware or a root Layout component.
 * 
 * Flow:
 * 1. Checks if the user is logged in via Auth0 and has an associated org_id.
 * 2. Looks up the Organization in Prisma using auth0OrgId.
 * 3. Finds the appropriate Department (Workspace) to assign the user to.
 * 4. Upserts the User in Prisma to guarantee they exist and are assigned.
 */
export async function syncUserToDatabase(session: any) {
    if (!session || !session.user || !session.user.sub || !session.user.email) {
        return null; // Not authenticated or invalid session
    }

    const { sub: auth0UserId, email, name, org_id } = session.user;

    // Fast-path: Check if user already exists to save heavy DB queries on every request.
    // If you cache this or call this sparingly (e.g. login callback route), this can be skipped.
    const existingUser = await prisma.user.findUnique({
        where: { auth0UserId },
        select: { id: true, departmentId: true }
    });

    if (existingUser && existingUser.departmentId) {
        return existingUser; // User is safely synced.
    }

    // New user or missing department logic
    if (!org_id) {
        console.warn(`[SyncUser] User ${email} logged in without an org_id. This shouldn't happen in B2B flow.`);
        // Fallback: perhaps assign to a default "Guest" org, or throw an error to deny access.
        throw new Error('User must belong to an organization.');
    }

    // 1. Find the parent Organization
    const organization = await prisma.organization.findUnique({
        where: { auth0OrgId: org_id },
        include: {
            // Include departments so we can pick one to link the user to
            departments: {
                take: 1, // Grab the primary department (you could expand logic here for multi-dept orgs)
            }
        }
    });

    if (!organization) {
        console.warn(`[SyncUser] Organization not found in DB for Auth0 org_id: ${org_id}`);
        throw new Error(`Workspace configuration error. Please contact support. (org_id: ${org_id})`);
    }

    if (organization.departments.length === 0) {
        throw new Error(`Organization ${organization.name} has no provisioned departments.`);
    }

    const primaryDepartmentId = organization.departments[0].id;

    // 2. Safely Upsert the User
    const user = await prisma.user.upsert({
        where: { auth0UserId },
        update: {
            // You can optionally update email/name on every login if they change in Auth0
            email,
            name: name || undefined,
            // Only update department if necessary (prevents overriding manual changes)
            departmentId: primaryDepartmentId,
        },
        create: {
            auth0UserId,
            email,
            name: name || 'Unknown',
            role: 'VIEWER', // Default safe role; Auth0 roles should likely dictate this in a robust setup
            departmentId: primaryDepartmentId,
        }
    });

    console.log(`[SyncUser] Synced user ${email} to department ${primaryDepartmentId}`);
    return user;
}
