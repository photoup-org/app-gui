require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');

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
            },
            expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
        });

        const pis = await stripe.paymentIntents.list({ customer: customer.id, limit: 1 });
        if (pis.data.length > 0) {
            fs.writeFileSync('pi-debug.json', JSON.stringify(pis.data[0], null, 2));
            console.log("Dumped PI to pi-debug.json");
        }
    } catch (e) {
        console.error(e);
    }
}
testSubscription();
