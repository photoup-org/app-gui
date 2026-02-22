import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { provisionWorkspace } from './workspace';

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription, previousAttributes: any) {
    if (
        previousAttributes?.status === 'incomplete' &&
        subscription.status === 'active'
    ) {
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
        await prisma.department.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { subStatus: 'PAST_DUE' } // Suspend access
        });
        // TODO: Block Auth0 access via Management API
    }
}

export async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
    const metadata = setupIntent.metadata || {};
    if (metadata.subscription_id) {
        const subscriptionId = metadata.subscription_id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        if (setupIntent.payment_method) {
            try {
                await stripe.subscriptions.update(subscriptionId, {
                    default_payment_method: setupIntent.payment_method as string
                });
                await stripe.customers.update(subscription.customer as string, {
                    invoice_settings: {
                        default_payment_method: setupIntent.payment_method as string
                    }
                });
                console.log(`[Webhook] Attached PaymentMethod ${setupIntent.payment_method} to Subscription ${subscriptionId}`);
            } catch (err) {
                console.error(`[Webhook] Failed to attach PaymentMethod:`, err);
            }
        }

        const subMetadata = subscription.metadata || {};
        await provisionWorkspace(subMetadata, subscription.customer as string, subscription.id);
    }
}
