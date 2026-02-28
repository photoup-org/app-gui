import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import * as handlers from '@/lib/services/stripe-handlers';

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
            case 'customer.subscription.updated':
                await handlers.handleSubscriptionUpdated(
                    event.data.object as any,
                    event.data.previous_attributes
                );
                break;

            case 'customer.subscription.deleted':
                await handlers.handleSubscriptionDeleted(event.data.object as any);
                break;


            case 'payment_intent.succeeded':
            case 'payment_intent.processing':
                await handlers.handlePaymentIntent(event.data.object as any);
                break;

            case 'checkout.session.completed':
                await handlers.handleCheckoutSessionCompleted(event.data.object as any);
                break;

            case 'invoice.paid':
                await handlers.handleInvoicePaid(event.data.object as any);
                break;

            case 'invoice.payment_failed':
                await handlers.handleInvoicePaymentFailed(event.data.object);
                break;

            case 'setup_intent.succeeded':
                await handlers.handleSetupIntentSucceeded(event.data.object as any);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

    } catch (e: any) {
        console.error('[Webhook] Error processing event:', e);
        return new NextResponse(`Webhook Error: ${e.message}`, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
