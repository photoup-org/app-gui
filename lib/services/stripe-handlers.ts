import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { provisionWorkspace } from './workspace';
import * as departmentService from '@/lib/repositories/department';
import { setupAuth0AndInvite } from './auth0-handlers';
import { executeTenantProvisioningTx } from '../checkout/handlers';
import prisma from '@/lib/prisma';


export async function handleInvoicePaid(rawInvoice: Stripe.Invoice) {
    const subscriptionId = (rawInvoice as any).subscription;

    if (rawInvoice.status !== 'paid' || !subscriptionId) return;
    // STEP 1: Pre-fetch external data outside the transaction
    const subscription = typeof subscriptionId === 'string'
        ? await stripe.subscriptions.retrieve(subscriptionId)
        : subscriptionId as Stripe.Subscription;

    const expandedInvoice = await stripe.invoices.retrieve(rawInvoice.id, { expand: ['lines.data.price.product'] });
    const metadata = subscription.metadata || {};

    const customerId = typeof rawInvoice.customer === 'string' ? rawInvoice.customer : rawInvoice.customer?.id;
    const userEmail = metadata.userEmail || rawInvoice.customer_email;
    const nif = metadata.nif;
    const rawPaymentIntent = (rawInvoice as any).payment_intent;

    const stripeIntentId = typeof rawPaymentIntent === 'string'
        ? rawPaymentIntent
        : rawPaymentIntent?.id;

    if (!customerId || !userEmail || !nif || !stripeIntentId) {
        console.error(`[Webhook] handleInvoicePaid missing critical metadata or IDs.`);
        return;
    }

    // Map expanded invoice lines to our helper format
    const lineItems = expandedInvoice.lines.data.map((item: any) => ({
        stripeProductId: typeof item.price?.product === 'string' ? item.price.product : item.price?.product?.id,
        quantity: item.quantity || 1
    }));

    try {
        // STEP 2: Fast DB Transaction
        const { department, organization } = await executeTenantProvisioningTx({
            nif,
            orgName: metadata.organizationName || 'New Organization',
            deptName: metadata.departmentName || 'Main Workspace',
            userEmail,
            userName: metadata.userName || 'Admin',
            jobTitle: metadata.jobTitle,
            phone: metadata.phone,
            metadata,
            stripeData: { customerId, subscriptionId: subscription.id, intentId: stripeIntentId },
            lineItems
        });

        // STEP 3: Post-Transaction Auth0 Integration
        await setupAuth0AndInvite(organization.name, department.id, userEmail);

    } catch (error: any) {
        if (error.code === 'P2002') return console.log(`[Webhook] handleInvoicePaid skipped (idempotency).`);
        throw error;
    }
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    if (!session || !session.metadata) return;

    const metadata = session.metadata;
    const userEmail = metadata.userEmail || session.customer_details?.email;
    const nif = metadata.nif;
    const stripeIntentId = (session.payment_intent as string) || (session.setup_intent as string);

    if (!userEmail || !nif || !stripeIntentId) {
        console.error('[Webhook] checkout.session.completed missing userEmail, nif, or intentId');
        return;
    }

    // STEP 1: Pre-fetch line items outside the transaction
    const lineItemsDesc = await stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price.product'] });
    const lineItems = lineItemsDesc.data.map((item: any) => ({
        stripeProductId: typeof item.price?.product === 'string' ? item.price.product : item.price?.product?.id,
        quantity: item.quantity || 1
    }));

    try {
        // STEP 2: Fast DB Transaction
        const { department, organization } = await executeTenantProvisioningTx({
            nif,
            orgName: metadata.organizationName || 'New Organization',
            deptName: metadata.departmentName || 'Main Workspace',
            userEmail,
            userName: metadata.userName || 'Admin',
            jobTitle: metadata.jobTitle,
            phone: metadata.phone,
            metadata,
            stripeData: {
                customerId: (session.customer as string) || `cus_PENDING_${Date.now()}`,
                subscriptionId: (session.subscription as string) || undefined,
                intentId: stripeIntentId
            },
            lineItems
        });

        // STEP 3: Post-Transaction Auth0 Integration
        await setupAuth0AndInvite(organization.name, department.id, userEmail);

    } catch (error: any) {
        if (error.code === 'P2002') return console.log(`[Webhook] handleCheckoutSessionCompleted skipped (idempotency).`);
        console.error(`[Webhook] Transaction Aborted:`, error);
        throw error;
    }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription, previousAttributes: any) {
    if (previousAttributes?.status === 'incomplete' && subscription.status === 'active') {
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
            } catch (err) {
                console.error(`[Webhook] Failed to attach PaymentMethod:`, err);
            }
        }
        await provisionWorkspace(subscription.metadata || {}, subscription.customer as string, subscription.id);
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