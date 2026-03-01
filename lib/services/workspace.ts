import prisma from '@/lib/prisma';
import { createOrg, generateAuth0InviteTicket, enableOrgConnection } from '@/lib/auth/auth0-management';
import { sendInvitationEmail } from '@/lib/services/email';

/**
 * Reusable service to provision the workspace atomically via Stripe metadata.
 */
export async function provisionWorkspace(metadata: any, customerId: string, subscriptionId: string | null) {
    try {
        await prisma.$transaction(async (tx) => {
            // 0. Idempotency Check
            const existingDept = await tx.department.findFirst({
                where: {
                    OR: [
                        { stripeCustomerId: customerId },
                        ...(subscriptionId ? [{ stripeSubscriptionId: subscriptionId }] : [])
                    ]
                }
            });
            if (existingDept) {
                console.log(`[Webhook] Workspace already provisioned for customer ${customerId}. Skipping duplicate.`);
                return;
            }

            // 1. Create Addresses
            const billingAddress = await tx.address.create({
                data: {
                    street: metadata.billing_street || '',
                    city: metadata.billing_city || '',
                    zipCode: metadata.billing_postal || '',
                    country: metadata.billing_country || '',
                    nif: metadata.nif || null,
                }
            });

            let shippingAddressId = billingAddress.id;
            if (metadata.hasDifferentShipping === 'true') {
                const shippingAddress = await tx.address.create({
                    data: {
                        street: metadata.shipping_street || '',
                        city: metadata.shipping_city || '',
                        zipCode: metadata.shipping_postal || '',
                        country: metadata.shipping_country || '',
                    }
                });
                shippingAddressId = shippingAddress.id;
            }

            // 2. Auth0 Organization Creation
            // We need a unique slug. 
            const orgSlug = (metadata.organizationName || 'org')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') + `-${Date.now().toString().slice(-6)}`;

            console.log(`[Webhook] Creating Auth0 Organization: ${orgSlug}`);

            let auth0OrgId = '';
            try {
                // Call the Auth0 Management API
                const auth0Org = await createOrg(orgSlug, metadata.organizationName || 'New Organization');
                auth0OrgId = auth0Org.id;

                // Enable DB connection for this newly created organization
                console.log(`[Webhook] Enabling DB connection for Auth0 Organization: ${auth0OrgId}`);
                await enableOrgConnection(auth0OrgId);
            } catch (authErr: any) {
                console.error(`[Webhook] Failed to create or configure Auth0 Organization:`, authErr);
                throw new Error(`Failed to create Auth0 Organization: ${authErr.message}`);
            }

            const nif = metadata.nif || `UNKNOWN-${Date.now()}`;
            const organization = await tx.organization.upsert({
                where: { nif },
                create: {
                    name: metadata.organizationName || 'New Organization',
                    nif,
                },
                update: {}
            });

            // 3. Create Department
            const departmentSlug = (metadata.departmentName || 'default').toLowerCase().replace(/[^a-z0-9]+/g, '-');

            await tx.department.create({
                data: {
                    name: metadata.departmentName || 'Main Workspace',
                    slug: `${departmentSlug}-${Date.now().toString().slice(-4)}`, // Ensure uniqueness
                    auth0OrgId: auth0OrgId, // <--- Moved here
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscriptionId,
                    organizationId: organization.id,
                    billingAddressId: billingAddress.id,
                    shippingAddressId: shippingAddressId,
                    subStatus: 'ACTIVE',
                }
            });

            console.log(`[Webhook] Optimistically provisioned Org and Dept for customer ${customerId}`);

            // 4. Invite the Admin User
            if (metadata.adminEmail && auth0OrgId) {
                try {
                    console.log(`[Webhook] Generating Auth0 Invite ticket for ${metadata.adminEmail} for Org ${auth0OrgId}`);
                    const ticket = await generateAuth0InviteTicket(auth0OrgId, metadata.adminEmail);
                    if (ticket) {
                        const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                        const customLink = `${domain}/auth/login?invitation=${ticket}&organization=${auth0OrgId}&screen_hint=signup`;
                        await sendInvitationEmail(metadata.adminEmail, customLink);
                    }
                } catch (inviteErr: any) {
                    console.error(`[Webhook] Failed to generate invite ticket for user ${metadata.adminEmail}:`, inviteErr);
                }
            }
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            console.log(`[Webhook] Workspace provisioning skipped due to unique constraint (likely a concurrent webhook race condition on customer ${customerId}).`);
            return;
        }
        throw error;
    }
}
