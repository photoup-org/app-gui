'use server';

import { stripe } from '@/lib/stripe';
import { isValidNIF } from '@/lib/utils';
import Stripe from 'stripe';

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

export async function createSubscriptionIntent(
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

        // Flatten nested form data safely into Stripe metadata constraints (max 500 chars)
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

        // Separate recurring and one-time items
        const recurringItems: { price: string; quantity?: number }[] = [];
        const addInvoiceItems: { price: string; quantity?: number }[] = [];
        let totalOneTimeAmount = 0;

        for (const item of lineItems) {
            const price = await stripe.prices.retrieve(item.price);
            if (price.type === 'recurring') {
                recurringItems.push(item);
            } else {
                addInvoiceItems.push(item);
                totalOneTimeAmount += (price.unit_amount || 0) * (item.quantity || 1);
            }
        }

        // 1. Get or Create Customer
        const customers = await stripe.customers.list({ email: formData.adminEmail, limit: 1 });
        let customerId;
        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
            // Optionally update customer metadata
            await stripe.customers.update(customerId, {
                metadata: {
                    nif: formData.nif,
                    organizationName: formData.organizationName
                }
            });
        } else {
            const customer = await stripe.customers.create({
                email: formData.adminEmail,
                name: formData.adminFullName,
                metadata: {
                    nif: formData.nif,
                    organizationName: formData.organizationName
                }
            });
            customerId = customer.id;
        }

        // 2. Create Intent (Subscription or PaymentIntent)
        if (recurringItems.length > 0) {
            // Subscription Flow
            const subscriptionParams: any = {
                customer: customerId,
                items: recurringItems.map(item => ({ price: item.price, quantity: item.quantity || 1 })),
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
                metadata: metadata,
            };

            // Force Stripe to generate a setup intent if there is a free trial
            // or a 0 amount invoice so we can still collect payment details using Stripe Elements
            subscriptionParams.payment_settings = {
                save_default_payment_method: 'on_subscription',
                payment_method_types: ['card', 'sepa_debit']
            };

            // Include one-time hardware items on the first invoice of the subscription
            if (addInvoiceItems.length > 0) {
                subscriptionParams.add_invoice_items = addInvoiceItems.map(item => ({
                    price: item.price,
                    quantity: item.quantity || 1
                }));
            }

            const subscription = await stripe.subscriptions.create(subscriptionParams);

            const invoice = subscription.latest_invoice as any;

            console.log("\n--- STRIPE SUBSCRIPTION RESP ---");
            console.log("Invoice ID:", invoice?.id);
            console.log("Payment Intent object:", !!invoice?.payment_intent);
            if (invoice?.payment_intent) {
                console.log("PI Client Secret:", invoice.payment_intent.client_secret);
            }
            console.log("Setup Intent object:", !!subscription.pending_setup_intent);

            let clientSecret = null;
            if (invoice && invoice.payment_intent && invoice.payment_intent.client_secret) {
                clientSecret = invoice.payment_intent.client_secret;
            } else if (subscription.pending_setup_intent) {
                clientSecret = (subscription.pending_setup_intent as Stripe.SetupIntent).client_secret;
            } else {
                // If it STILL didn't generate one, we force a manual SetupIntent creation
                // so that we can render the Stripe Element and save the card to the customer
                const setupIntent = await stripe.setupIntents.create({
                    customer: customerId,
                    payment_method_types: ['card', 'sepa_debit'],
                    metadata: {
                        subscription_id: subscription.id
                    }
                });
                clientSecret = setupIntent.client_secret;
            }

            if (!clientSecret) {
                console.error("No client secret found! This usually means the price was 0 but no setup intent was asked for, or expansion failed.");
                throw new Error('Failed to generate payment or setup intent for subscription.');
            }

            return {
                clientSecret,
                subscriptionId: subscription.id
            };
        } else {
            // One-time only flow (Hardware only)
            if (totalOneTimeAmount === 0) throw new Error('Invalid cart total.');

            const paymentIntent = await stripe.paymentIntents.create({
                amount: totalOneTimeAmount,
                currency: 'eur', // TODO: Dynamically fetch currency or enforce EUR
                customer: customerId,
                metadata: metadata,
                automatic_payment_methods: { enabled: true },
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };
        }

    } catch (error: any) {
        console.error('Error creating subscription intent:', error);
        throw new Error(error.message || 'Failed to initialize payment.');
    }
}
