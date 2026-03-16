import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import * as departmentService from '@/lib/repositories/department';
import { setupAuth0AndInvite } from './auth0-handlers';
import { executeTenantProvisioningTx } from '../checkout/handlers';
import prisma from '@/lib/prisma';


export async function handleInvoicePaid(rawInvoice: Stripe.Invoice) {
    console.log(`\n--- [WEBHOOK TRIGGERED] handleInvoicePaid ---`);
    console.log(`Invoice ID: ${rawInvoice.id}`);

    if (rawInvoice.status !== 'paid') {
        console.warn(`[Webhook] Aborting: Invoice status is '${rawInvoice.status}'.`);
        return;
    }

    // FIXED: Removed the invalid 'lines.data.pricing.price_details.product' expansion path
    const fullInvoice: any = await stripe.invoices.retrieve(rawInvoice.id, { 
        expand: ['lines.data.price.product'] 
    });

    // 1. EXACT EXTRACTION FROM NEW STRIPE JSON STRUCTURE
    const subscriptionId = fullInvoice.parent?.subscription_details?.subscription
        || fullInvoice.subscription;

    // Fallback to Invoice ID so our DB has a unique transaction receipt
    const stripeIntentId = fullInvoice.payment_intent
        || fullInvoice.id;

    const customerId = fullInvoice.customer;
    const billingReason = fullInvoice.billing_reason;

    console.log(`Extracted Sub ID: ${subscriptionId || 'MISSING'}`);
    console.log(`Extracted Receipt ID: ${stripeIntentId}`);
    console.log(`Billing Reason: ${billingReason}`);

    // =========================================================
    // SCENARIO 1: INITIAL PURCHASE (Provision Everything)
    // =========================================================
    if (billingReason === 'subscription_create') {
        console.log(`[Webhook] Initial purchase. Extracting metadata from nested parent...`);

        // Extract metadata directly from the invoice's new parent object
        const aggregatedMetadata = fullInvoice.parent?.subscription_details?.metadata
            || fullInvoice.lines?.data?.[0]?.metadata
            || {};

        const userEmail = aggregatedMetadata.userEmail || fullInvoice.customer_email;
        const nif = aggregatedMetadata.nif;

        if (!customerId || !userEmail || !nif) {
            console.error(`[Webhook] ABORTED: Missing critical data.`);
            console.error(`Metadata found:`, aggregatedMetadata);
            return;
        }

        // Handle nested line items parsing based on the JSON dump
        const lineItems = fullInvoice.lines.data.map((item: any) => {
            const productId = item.pricing?.price_details?.product
                || (typeof item.price?.product === 'string' ? item.price.product : item.price?.product?.id);
            return {
                stripeProductId: productId,
                quantity: item.quantity || 1
            };
        });

        try {
            console.log(`[Webhook] Metadata secured. Provisioning Database...`);
            const { department, organization } = await executeTenantProvisioningTx({
                nif,
                orgName: aggregatedMetadata.organizationName || 'New Organization',
                deptName: aggregatedMetadata.departmentName || 'Main Workspace',
                userEmail,
                userName: aggregatedMetadata.userName || 'Admin',
                jobTitle: aggregatedMetadata.jobTitle,
                phone: aggregatedMetadata.phone,
                metadata: aggregatedMetadata,
                stripeData: {
                    customerId: customerId as string,
                    subscriptionId: subscriptionId as string,
                    intentId: stripeIntentId as string
                },
                lineItems
            });

            await setupAuth0AndInvite(organization.name, department.id, userEmail);

        } catch (error: any) {
            if (error.code === 'P2002') return console.log(`[Webhook] handleInvoicePaid skipped (idempotency).`);
            console.error(`[Webhook] Database Provisioning Failed:`, error);
            throw error;
        }
    }
    // =========================================================
    // SCENARIO 2: RECURRING RENEWAL
    // =========================================================
    else if (billingReason === 'subscription_cycle') {
        if (!subscriptionId) return console.warn(`[Webhook] Cannot process renewal: No sub ID.`);
        console.log(`[Webhook] Renewal for sub: ${subscriptionId}. Updating status...`);
        try {
            await departmentService.updateDepartmentStatusByStripeSubscriptionId(subscriptionId as string, 'ACTIVE');
        } catch (error) {
            console.error(`[Webhook] Failed to update status:`, error);
        }
    }
    else {
        console.log(`[Webhook] Unhandled reason: ${billingReason}. Ignoring.`);
    }
}


export async function handleInvoicePaymentFailed(invoice: any) {
    if (invoice.subscription) {
        console.log(`[Webhook] Async recurring payment failed for subscription: ${invoice.subscription}`);
        await departmentService.updateDepartmentStatusByStripeSubscriptionId(invoice.subscription as string, 'PAST_DUE');
    }
}

export async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
    const metadata = setupIntent.metadata || {};
    if (metadata.subscription_id) {
        const subscriptionId = metadata.subscription_id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        if (setupIntent.payment_method) {
            try {
                await stripe.subscriptions.update(subscriptionId, { default_payment_method: setupIntent.payment_method as string });
                await stripe.customers.update(subscription.customer as string, {
                    invoice_settings: { default_payment_method: setupIntent.payment_method as string }
                });
                console.log(`[Webhook] Successfully attached PaymentMethod to Subscription ${subscriptionId}`);
            } catch (err) {
                console.error(`[Webhook] Failed to attach PaymentMethod:`, err);
            }
        }
    }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
        const department = await departmentService.findDepartmentByStripeSubscriptionId(subscription.id);
        if (!department) return;
        await departmentService.updateDepartmentStatus(department.id, 'CANCELED');
        console.log(`[Stripe Webhook] Department ${department.id} subscription canceled.`);
    } catch (error) {
        throw error;
    }
}

export async function handlePriceUpdated(price: Stripe.Price) {
    if (!price.unit_amount) return;
    const productId = typeof price.product === 'string' ? price.product : price.product.id;
    try {
        await prisma.planTier.update({
            where: { stripeProductId: productId },
            data: { priceAmount: price.unit_amount, currency: price.currency }
        });
    } catch (error) {
        console.log(`[Webhook] Price event received, but no PlanTier found for Stripe Product ${productId}.`);
    }
}