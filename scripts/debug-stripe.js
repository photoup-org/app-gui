require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover'
});

async function testSubscription() {
    try {
        const customer = await stripe.customers.create({
            email: 'test@example.com',
            name: 'Test Customer',
            address: { country: 'PT' }
        });

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: 'price_1Sw1Wg5Br3qnfEfN4OVbYrgh', quantity: 1 }],
            payment_behavior: 'default_incomplete',
            payment_settings: {
                save_default_payment_method: 'on_subscription',
            }
        });

        const invoiceId = subscription.latest_invoice;
        console.log("Subscription returned Invoice ID:", (typeof invoiceId === 'string' ? invoiceId : invoiceId.id));
        
        const invoice = await stripe.invoices.retrieve(
            typeof invoiceId === 'string' ? invoiceId : invoiceId.id,
            { expand: ['payment_intent'] }
        );

        console.log("Retrieved Invoice ID:", invoice.id);
        console.log("Does it have payment_intent key?", 'payment_intent' in invoice);
        if (invoice.payment_intent) {
            console.log("Payment Intent inside:", invoice.payment_intent.client_secret || invoice.payment_intent);
        } else {
            console.log("Still no payment intent on retrieved invoice.");
            console.log("Checking confirmation_secret:", invoice.confirmation_secret);
        }
        
        // Also fetch the customer's PIs
        const pis = await stripe.paymentIntents.list({ customer: customer.id, limit: 1 });
        if (pis.data.length > 0) {
            console.log("PI order_reference:", pis.data[0].payment_details?.order_reference);
        }
    } catch (e) {
        console.error(e);
    }
}
testSubscription();
