import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma'; // Use existing Prisma client
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('Stripe-Signature') as string;

    let event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.error('STRIPE_WEBHOOK_SECRET is missing');
            return new NextResponse('Configuration Error', { status: 500 });
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                // For SEPA, payment might be 'processing' immediately, or 'paid' if card.
                // We optimistically provision the software side either way.
                if (session.payment_status === 'paid' || (session.payment_status as string) === 'processing') {
                    const metadata = session.metadata || {};

                    // We must use a transaction to ensure atomic creation of Addresses, Org, and Dept
                    await prisma.$transaction(async (tx) => {
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

                        // 2. Optimistic Organization Creation
                        // Note: auth0OrgId is marked as @unique and required. 
                        // In reality, you'd call Auth0 API here to create the org, then use that ID.
                        // We use a temporary pending prefix for the DB constraint until Auth0 syncs.
                        const tempAuth0OrgId = `pending_org_${session.id}`;

                        const organization = await tx.organization.create({
                            data: {
                                name: metadata.organizationName || 'New Organization',
                                auth0OrgId: tempAuth0OrgId,
                            }
                        });

                        // 3. Create Department
                        const departmentSlug = (metadata.departmentName || 'default').toLowerCase().replace(/[^a-z0-9]+/g, '-');

                        await tx.department.create({
                            data: {
                                name: metadata.departmentName || 'Main Workspace',
                                slug: `${departmentSlug}-${Date.now().toString().slice(-4)}`, // Ensure uniqueness
                                stripeCustomerId: session.customer as string,
                                // @ts-ignore: Prisma client types might be stale during dev
                                stripeSubscriptionId: session.subscription as string,
                                organizationId: organization.id,
                                billingAddressId: billingAddress.id,
                                shippingAddressId: shippingAddressId,
                                subStatus: 'ACTIVE',
                            }
                        });

                        // TODO: Create Hardware Order record and mark as "Awaiting Clearing"
                        console.log(`[Webhook] Optimistically provisioned Org and Dept for session ${session.id}`);

                        // TODO: trigger Auth0 Organization creation via Management API
                        // TODO: send Auth0 user invite to metadata.adminEmail
                    });
                }
                break;
            }

            case 'checkout.session.async_payment_succeeded': {
                const session = event.data.object as any;
                console.log(`[Webhook] Async payment succeeded for session: ${session.id}`);

                // TODO: Update the hardware order status in the DB to "Ready for Shipping"
                // e.g. await prisma.hardwareOrder.update({ where: { stripeSessionId: session.id }, data: { status: 'READY_FOR_SHIPPING' } })
                break;
            }

            case 'checkout.session.async_payment_failed': {
                const session = event.data.object as any;
                console.log(`[Webhook] Async payment failed for session: ${session.id}`);

                // 1. Suspend the Department
                await prisma.department.updateMany({
                    where: { stripeCustomerId: session.customer as string },
                    data: { subStatus: 'PAST_DUE' } // Suspend access
                });

                // TODO: Block Auth0 access via Management API
                // TODO: Update Hardware Order status in DB to "Failed"
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

    } catch (e: any) {
        console.error('[Webhook] Error processing event:', e);
        return new NextResponse(`Webhook Error: ${e.message}`, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
