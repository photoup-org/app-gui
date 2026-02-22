import prisma from '@/lib/prisma';
import { createOrg, inviteAdminToOrg, enableOrgConnection } from '@/lib/auth0-management';

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
                // Fallback so the DB transaction doesn't crater if Auth0 fails
                auth0OrgId = `pending_org_${customerId}_${Date.now()}`;
            }

            const organization = await tx.organization.create({
                data: {
                    name: metadata.organizationName || 'New Organization',
                    auth0OrgId: auth0OrgId,
                }
            });

            // 3. Create Department
            const departmentSlug = (metadata.departmentName || 'default').toLowerCase().replace(/[^a-z0-9]+/g, '-');

            await tx.department.create({
                data: {
                    name: metadata.departmentName || 'Main Workspace',
                    slug: `${departmentSlug}-${Date.now().toString().slice(-4)}`, // Ensure uniqueness
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
            if (metadata.adminEmail && auth0OrgId && !auth0OrgId.startsWith('pending_org_')) {
                try {
                    console.log(`[Webhook] Sending Auth0 Invite to ${metadata.adminEmail} for Org ${auth0OrgId}`);
                    await inviteAdminToOrg(auth0OrgId, metadata.adminEmail);
                } catch (inviteErr: any) {
                    console.error(`[Webhook] Failed to invite user ${metadata.adminEmail}:`, inviteErr);
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
