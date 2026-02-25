'use server';

import { stripe } from '@/lib/stripe';
import { isValidNIF } from '@/lib/utils';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

export async function getStripeProducts() {
    try {
        const products = await stripe.products.list({
            active: true,
            expand: ['data.default_price'],
            limit: 100,
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
    lineItems: { price: string; quantity?: number }[],
    extraSensorsCount: number = 0
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

        let logisticsCartParsed = '[]';
        const planId = recurringItems.length > 0 ? recurringItems[0].price : undefined;

        if (planId) {
            const tier = await prisma.planTier.findUnique({ where: { stripePlanPriceId: planId } });
            if (tier) {
                if (extraSensorsCount > 0 && tier.extraSensorStripePriceId) {
                    addInvoiceItems.push({ price: tier.extraSensorStripePriceId, quantity: extraSensorsCount });
                    // Retrieve price to accurately update total one-time amount
                    const extraSensorsPrice = await stripe.prices.retrieve(tier.extraSensorStripePriceId);
                    totalOneTimeAmount += (extraSensorsPrice.unit_amount || 0) * extraSensorsCount;
                }

                const logisticsCart = [
                    { type: 'gateway', quantity: tier.includedGateways },
                    { type: 'sensor', quantity: tier.includedSensors + extraSensorsCount }
                ];
                logisticsCartParsed = JSON.stringify(logisticsCart);
            }
        }

        // 1. Get or Create Customer
        const customers = await stripe.customers.list({ email: formData.adminEmail, limit: 1 });
        let customerId;
        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
            // Optionally update customer metadata and address for SEPA
            await stripe.customers.update(customerId, {
                name: formData.adminFullName, // Ensure name is up to date for mandates
                address: {
                    country: formData.billingAddress.country
                },
                metadata: {
                    nif: formData.nif,
                    organizationName: formData.organizationName
                }
            });
        } else {
            const customer = await stripe.customers.create({
                email: formData.adminEmail,
                name: formData.adminFullName,
                address: {
                    country: formData.billingAddress.country
                },
                metadata: {
                    nif: formData.nif,
                    organizationName: formData.organizationName
                }
            });
            customerId = customer.id;
        }

        // 2. Create Intent (Subscription or PaymentIntent)
        if (recurringItems.length > 0) {
            // Subscription Flow: Using modern automatic payment methods (controlled via Stripe Dashboard)
            const subscriptionParams: Stripe.SubscriptionCreateParams = {
                customer: customerId,
                items: recurringItems.map(item => ({ price: item.price, quantity: item.quantity || 1 })),
                payment_behavior: 'default_incomplete',
                payment_settings: {
                    save_default_payment_method: 'on_subscription',
                },
                expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
                metadata: {
                    ...metadata,
                    planId: planId!, // ensure Plan ID is logged using the unified DB system
                    logisticsCart: logisticsCartParsed
                },
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
            console.log("Setup Intent object:", !!subscription.pending_setup_intent);

            let clientSecret = null;
            if (invoice?.payment_intent) {
                console.log("PI Client Secret Generated SUCCESSFULLY:", invoice.payment_intent.id);
                clientSecret = invoice.payment_intent.client_secret;
            } else if (subscription.pending_setup_intent) {
                const setupIntent = subscription.pending_setup_intent as any;
                console.log("Setup Intent Client Secret Generated SUCCESSFULLY:", setupIntent.id);
                clientSecret = setupIntent.client_secret;
            } else if (invoice?.id) {
                console.log("Payment Intent not on invoice natively (Stripe API 2026 behavior). Fetching latest PI...");
                const pis = await stripe.paymentIntents.list({ customer: customerId, limit: 1 });
                if (pis.data.length > 0) {
                    const latestPi = pis.data[0] as any;
                    if (latestPi.payment_details?.order_reference === invoice.id || latestPi.description === "Subscription creation") {
                        console.log("PI Client Secret Fetched via order_reference:", latestPi.id);
                        clientSecret = latestPi.client_secret;
                    }
                }
            }

            if (!clientSecret) {
                console.error("No client secret found! Ensure 'SEPA Direct Debit' and 'Cards' are enabled in Stripe Dashboard -> Settings -> Payment Methods.");
                console.error("Invoice dump:", JSON.stringify(invoice, null, 2));
                throw new Error('Failed to generate payment intent for subscription. Check Stripe Dashboard configuration.');
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
