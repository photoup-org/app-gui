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
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const previousAttributes = event.data.previous_attributes as any;

                // We only want to provision ONCE when it transitions OUT of incomplete
                // to active.
                if (
                    previousAttributes?.status === 'incomplete' &&
                    subscription.status === 'active'
                ) {
                    const metadata = subscription.metadata || {};
                    await provisionWorkspace(metadata, subscription.customer as string, subscription.id);
                }
                break;
            }

            case 'payment_intent.succeeded':
            case 'payment_intent.processing': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const metadata = paymentIntent.metadata || {};

                // If this is part of a subscription, the subscription webhook will handle it.
                // We only care if metadata contains organizationName (meaning it was a standalone hardware order)
                if (metadata.organizationName && !(paymentIntent as any).invoice) {
                    await provisionWorkspace(metadata, paymentIntent.customer as string, null);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                if (invoice.subscription) {
                    console.log(`[Webhook] Async recurring payment failed for subscription: ${invoice.subscription}`);

                    // Suspend the Department
                    await prisma.department.updateMany({
                        where: { stripeSubscriptionId: invoice.subscription as string },
                        data: { subStatus: 'PAST_DUE' } // Suspend access
                    });

                    // TODO: Block Auth0 access via Management API
                }
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

/**
 * Reusable helper to provision the workspace atomically.
 */
async function provisionWorkspace(metadata: Record<string, string>, customerId: string, subscriptionId: string | null) {
    if (!metadata.organizationName) return; // Prevent spurious runs if metadata is missing

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
        const tempAuth0OrgId = `pending_org_${customerId}_${Date.now()}`;

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
                stripeCustomerId: customerId,
                // @ts-ignore: Prisma client types might be stale during dev
                stripeSubscriptionId: subscriptionId,
                organizationId: organization.id,
                billingAddressId: billingAddress.id,
                shippingAddressId: shippingAddressId,
                subStatus: 'ACTIVE',
            }
        });

        console.log(`[Webhook] Optimistically provisioned Org and Dept for customer ${customerId}`);
    });
}
