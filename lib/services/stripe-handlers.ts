import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { provisionWorkspace } from './workspace';
import { createOrg, enableOrgConnection, generateAuth0InviteTicket } from '@/lib/auth0-management';
import { sendInvitationEmail } from '@/lib/services/email';

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription, previousAttributes: any) {
    if (
        previousAttributes?.status === 'incomplete' &&
        subscription.status === 'active'
    ) {
        const metadata = subscription.metadata || {};
        await provisionWorkspace(metadata, subscription.customer as string, subscription.id);
    }
}

export async function handlePaymentIntent(paymentIntent: Stripe.PaymentIntent) {
    const metadata = paymentIntent.metadata || {};
    if (metadata.organizationName && !(paymentIntent as any).invoice) {
        await provisionWorkspace(metadata, paymentIntent.customer as string, null);
    }
}

export async function handleInvoicePaymentFailed(invoice: any) {
    if (invoice.subscription) {
        console.log(`[Webhook] Async recurring payment failed for subscription: ${invoice.subscription}`);
        await prisma.department.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { subStatus: 'PAST_DUE' } // Suspend access
        });
        // TODO: Block Auth0 access via Management API
    }
}

export async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
    const metadata = setupIntent.metadata || {};
    if (metadata.subscription_id) {
        const subscriptionId = metadata.subscription_id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        if (setupIntent.payment_method) {
            try {
                await stripe.subscriptions.update(subscriptionId, {
                    default_payment_method: setupIntent.payment_method as string
                });
                await stripe.customers.update(subscription.customer as string, {
                    invoice_settings: {
                        default_payment_method: setupIntent.payment_method as string
                    }
                });
                console.log(`[Webhook] Attached PaymentMethod ${setupIntent.payment_method} to Subscription ${subscriptionId}`);
            } catch (err) {
                console.error(`[Webhook] Failed to attach PaymentMethod:`, err);
            }
        }

        const subMetadata = subscription.metadata || {};
        await provisionWorkspace(subMetadata, subscription.customer as string, subscription.id);
    }
}

export async function handleInvoicePaid(rawInvoice: Stripe.Invoice) {
    const invoice = rawInvoice as any;
    if (invoice.status !== 'paid' || !invoice.subscription) return;

    const subscription = typeof invoice.subscription === 'string'
        ? await stripe.subscriptions.retrieve(invoice.subscription)
        : invoice.subscription as Stripe.Subscription;

    const metadata = subscription.metadata || {};
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
    if (!customerId) return;

    const nif = metadata.nif || `UNKNOWN-${Date.now()}`;
    const orgName = metadata.organizationName || 'New Organization';
    const deptName = metadata.departmentName || 'Main Workspace';
    const adminEmail = metadata.userEmail || invoice.customer_email;

    try {
        await prisma.$transaction(async (tx) => {
            const organization = await tx.organization.upsert({
                where: { nif },
                create: {
                    name: orgName,
                    nif,
                },
                update: {}
            });

            let department = await tx.department.findUnique({
                where: { stripeSubscriptionId: subscription.id }
            });

            let auth0OrgId = department?.auth0OrgId;
            let isNewDept = false;

            if (!department) {
                isNewDept = true;
                const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + `-${Date.now().toString().slice(-6)}`;
                console.log(`[Webhook] Creating Auth0 Organization: ${orgSlug}`);

                try {
                    const auth0Org = await createOrg(orgSlug, orgName);
                    auth0OrgId = auth0Org.id;
                    await enableOrgConnection(auth0OrgId as string);
                } catch (authErr: any) {
                    console.error(`[Webhook] Failed to create or configure Auth0 Organization:`, authErr);
                    throw new Error(`Failed to create Auth0 Organization: ${authErr.message}`);
                }

                const billingAddress = await tx.address.create({
                    data: {
                        street: metadata.billing_street || '',
                        city: metadata.billing_city || '',
                        zipCode: metadata.billing_postal || '',
                        country: metadata.billing_country || '',
                        nif: nif,
                    }
                });

                const deptSlug = deptName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                department = await tx.department.create({
                    data: {
                        name: deptName,
                        slug: `${deptSlug}-${Date.now().toString().slice(-4)}`,
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: subscription.id,
                        auth0OrgId: auth0OrgId!,
                        organizationId: organization.id,
                        billingAddressId: billingAddress.id,
                        subStatus: 'ACTIVE',
                    }
                });
            }

            const order = await tx.order.create({
                data: {
                    departmentId: department.id,
                    status: 'PAID_UNSHIPPED'
                }
            });

            for (const item of invoice.lines.data) {
                const price = item.price;
                if (price && price.product) {
                    const productIdStripe = typeof price.product === 'string' ? price.product : price.product.id;
                    const hardware = await tx.hardwareProduct.findUnique({
                        where: { stripeProductId: productIdStripe }
                    });

                    if (hardware) {
                        await tx.orderItem.create({
                            data: {
                                orderId: order.id,
                                productId: hardware.id,
                                quantity: item.quantity || 1
                            }
                        });
                    }
                }
            }

            if (isNewDept && adminEmail && auth0OrgId) {
                try {
                    console.log(`[Webhook] Generating Auth0 Invite for ${adminEmail} (Org: ${auth0OrgId})`);
                    const ticket = await generateAuth0InviteTicket(auth0OrgId, adminEmail);

                    if (ticket) {
                        const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                        const customLink = `${domain}/auth/login?invitation=${ticket}&organization=${auth0OrgId}&screen_hint=signup`;
                        await sendInvitationEmail(adminEmail, customLink);
                    } else {
                        console.error(`[Webhook] Could not parse ticket from Auth0 response.`);
                    }
                } catch (inviteErr: any) {
                    console.error(`[Webhook] Failed to securely generate invite ticket for ${adminEmail}:`, inviteErr);
                }
            }
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            console.log(`[Webhook] handleInvoicePaid skipped due to unique constraint (idempotency).`);
            return;
        }
        throw error;
    }
}
