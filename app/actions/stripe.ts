'use server';

import { stripe } from '@/lib/stripe';
import { isValidNIF } from '@/lib/utils';

export async function getStripeProducts() {
    try {
        const products = await stripe.products.list({
            active: true,
            expand: ['data.default_price'],
        });

        const prices = await stripe.prices.list({
            active: true,
            type: 'recurring',
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

export interface CheckoutFormData {
    organizationName: string;
    departmentName: string;
    nif: string;
    internalReference?: string;
    adminFullName: string;
    adminEmail: string;
    jobTitle: string;
    phone: string;
    billingAddress: {
        streetAddress: string;
        postalCode: string;
        city: string;
        country: string;
    };
    shippingAddress?: {
        streetAddress: string;
        postalCode: string;
        city: string;
        country: string;
    };
}

export async function createCheckoutSession(
    formData: CheckoutFormData,
    lineItems: { price: string; quantity?: number }[]
) {
    try {
        if (!formData.adminEmail || lineItems.length === 0) {
            throw new Error('Email and line items are required.');
        }

        if (!isValidNIF(formData.nif)) {
            throw new Error('Invalid Portuguese NIF provided.');
        }

        // Flatten nested form data safely into Stripe metadata constraints (string values, max 500 chars)
        const metadata: Record<string, string> = {
            organizationName: formData.organizationName.substring(0, 500),
            departmentName: formData.departmentName.substring(0, 500),
            nif: formData.nif.substring(0, 500),
            adminFullName: formData.adminFullName.substring(0, 500),
            adminEmail: formData.adminEmail.substring(0, 500),
            jobTitle: formData.jobTitle.substring(0, 500),
            phone: formData.phone.substring(0, 500),
            billing_street: formData.billingAddress.streetAddress.substring(0, 500),
            billing_city: formData.billingAddress.city.substring(0, 500),
            billing_postal: formData.billingAddress.postalCode.substring(0, 500),
            billing_country: formData.billingAddress.country.substring(0, 500),
        };

        if (formData.internalReference) {
            metadata.internalReference = formData.internalReference.substring(0, 500);
        }

        if (formData.shippingAddress) {
            metadata.shipping_street = formData.shippingAddress.streetAddress.substring(0, 500);
            metadata.shipping_city = formData.shippingAddress.city.substring(0, 500);
            metadata.shipping_postal = formData.shippingAddress.postalCode.substring(0, 500);
            metadata.shipping_country = formData.shippingAddress.country.substring(0, 500);
            metadata.hasDifferentShipping = 'true';
        } else {
            metadata.hasDifferentShipping = 'false';
        }

        // Dynamically determine the correct checkout mode by checking the prices in Stripe
        let hasRecurring = false;
        for (const item of lineItems) {
            const price = await stripe.prices.retrieve(item.price);
            if (price.type === 'recurring') {
                hasRecurring = true;
                break;
            }
        }
        const checkoutMode = hasRecurring ? 'subscription' : 'payment';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'sepa_debit'],
            line_items: lineItems.map((item) => ({
                price: item.price,
                quantity: item.quantity || 1,
            })),
            mode: checkoutMode,
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout`,
            customer_email: formData.adminEmail,
            metadata: metadata,
        });

        if (!session.url) {
            throw new Error('Failed to create Stripe Checkout session URL.');
        }

        return { url: session.url };
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        throw new Error(error.message || 'Failed to create checkout session.');
    }
}
