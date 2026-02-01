import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.warn('STRIPE_WEBHOOK_SECRET is not defined');
            // For safety in development if not set, but arguably should 500.
            // We'll throw to catch below.
            throw new Error('STRIPE_WEBHOOK_SECRET is missing');
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

    // Handle the event
    switch (event.type) {
        case 'invoice.payment_succeeded':
            const invoice = event.data.object as any;
            const customerId = invoice.customer;
            const subscriptionId = invoice.subscription;
            console.log(`Payment succeeded for customer: ${customerId}, subscription: ${subscriptionId}`);
            // Logic to update user status in DB would go here
            break;
        case 'customer.subscription.created':
            const subscription = event.data.object as any;
            console.log(`Subscription created: ${subscription.id}`);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
