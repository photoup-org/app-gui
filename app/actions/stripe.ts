'use server';

import { stripe } from '@/lib/stripe';

export async function getStripeProducts() {
    try {
        const products = await stripe.products.list({
            active: true,
            expand: ['data.default_price'],
        });

        const prices = await stripe.prices.list({
            active: true,
            limit: 100,
        });

        // Map prices to products
        const productsWithPrices = products.data.map((product) => {
            const productPrices = prices.data.filter((price) => price.product === product.id);

            // Serialize for client components (remove non-serializable data if any, though Stripe objects are usually fine JSON)
            // We will return a simplified object to be safe and clean
            return {
                id: product.id,
                name: product.name,
                description: product.description,
                prices: productPrices.map(p => ({
                    id: p.id,
                    unit_amount: p.unit_amount,
                    currency: p.currency,
                }))
            };
        });

        return productsWithPrices;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function createStripeSubscription(email: string, name: string, priceId: string) {
    try {
        if (!email || !priceId) {
            throw new Error('Email and Price ID are required');
        }

        // 1. Create a Customer
        const customer = await stripe.customers.create({
            email,
            name,
        });

        // 2. Create a Subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });

        const invoice = subscription.latest_invoice as any;
        const paymentIntent = invoice.payment_intent;

        return {
            subscriptionId: subscription.id,
            clientSecret: paymentIntent.client_secret,
        };
    } catch (error: any) {
        console.error('Error creating subscription:', error);
        throw new Error(error.message || 'Failed to create subscription');
    }
}
