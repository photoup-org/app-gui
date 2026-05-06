import prisma from '@/lib/prisma';
import { createOrg, generateAuth0InviteTicket, enableOrgConnection } from '@/lib/auth/auth0-management';
import { sendInvitationEmail } from '@/lib/services/email';
import { createHardwareOrderTx } from '@/lib/repositories/workspace';

/**
 * Reusable service to provision the workspace atomically via Stripe metadata.
 */
export async function provisionWorkspace(metadata: any, paymentIntent: string, customerId: string, subscriptionId: string | null) {
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
            let parsedBilling = null;
            if (metadata.billingAddress) {
                try { parsedBilling = JSON.parse(metadata.billingAddress); } catch (e) { }
            }
            const billingAddress = await tx.address.create({
                data: {
                    street: parsedBilling?.streetAddress || '',
                    city: parsedBilling?.city || '',
                    zipCode: parsedBilling?.postalCode || '',
                    country: parsedBilling?.country || '',
                    nif: metadata.nif || null,
                }
            });

            let shippingAddressId: string | null = null;
            if (metadata.shippingAddress) {
                let parsedShipping = null;
                try { parsedShipping = JSON.parse(metadata.shippingAddress); } catch (e) { }
                if (parsedShipping) {
                    const shippingAddress = await tx.address.create({
                        data: {
                            street: parsedShipping?.streetAddress || '',
                            city: parsedShipping?.city || '',
                            zipCode: parsedShipping?.postalCode || '',
                            country: parsedShipping?.country || '',
                        }
                    });
                    shippingAddressId = shippingAddress.id;
                }
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

            const department = await tx.department.create({
                data: {
                    name: metadata.departmentName || 'Main Workspace',
                    slug: `${departmentSlug}-${Date.now().toString().slice(-4)}`, // Ensure uniqueness
                    auth0OrgId: auth0OrgId,
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscriptionId,
                    organizationId: organization.id,
                    billingAddressId: billingAddress.id,
                    shippingAddressId: shippingAddressId,
                    subStatus: 'ACTIVE',
                }
            });

            let createdUserId: string | null = null;
            if (metadata.userEmail) {
                const userName = metadata.userName || 'Admin';
                const user = await tx.user.create({
                    data: {
                        email: metadata.userEmail,
                        name: userName,
                        role: 'ADMIN',
                        departmentId: department.id,
                    }
                });
                createdUserId = user.id;
            }

            console.log(`[Webhook] Optimistically provisioned Org and Dept for customer ${customerId}`);

            let cart: any[] = [];
            if (metadata.pendingCartId) {
                const pendingCart = await tx.pendingCart.findUnique({
                    where: { id: metadata.pendingCartId }
                });
                if (pendingCart) {
                    cart = pendingCart.items as any[];
                }
            } else if (metadata.cartItems) {
                // Backward compatibility fallback
                try { cart = JSON.parse(metadata.cartItems); } catch (e) { }
            }

            if (cart.length > 0) {
                await createHardwareOrderTx(tx, department.id, cart, paymentIntent, metadata.userEmail, createdUserId);
            }

            // 4. Invite the Admin User
            if (metadata.userEmail && auth0OrgId) {
                try {
                    console.log(`[Webhook] Generating Auth0 Invite ticket for ${metadata.userEmail} for Org ${auth0OrgId}`);
                    const ticket = await generateAuth0InviteTicket(auth0OrgId, metadata.userEmail);
                    if (ticket) {
                        const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                        const customLink = `${domain}/auth/login?invitation=${ticket}&organization=${auth0OrgId}&screen_hint=signup`;
                        await sendInvitationEmail(metadata.userEmail, customLink);
                    }
                } catch (inviteErr: any) {
                    console.error(`[Webhook] Failed to generate invite ticket for user ${metadata.userEmail}:`, inviteErr);
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

/**
 * Data Access Layer (DAL) for fetching aggregated workspace context.
 * This is used in server components/layouts to fetch heavy data while keeping
 * the React Context lean.
 * 
 * @param auth0UserId The Auth0 user ID (sub)
 * @returns The user object with included department, plan, latest order, and device count.
 */
// lib/services/workspace.ts

export async function getUserWorkspaceContext(auth0UserId: string) {
    const user = await prisma.user.findUnique({
        where: { auth0UserId },
        include: {
            department: {
                include: {
                    organization: true,
                    plan: true,
                    orders: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        include: {
                            items: {
                                include: { product: true },
                            },
                        },
                    },
                    _count: {
                        select: { devices: true },
                    },
                },
            },
        },
    });

    return user;
}
