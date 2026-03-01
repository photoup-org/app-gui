require('dotenv').config({ path: '.env.local' });
const stripeInstance = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testCreate() {
    try {
        const customers = await stripeInstance.customers.list({ limit: 1 });
        const customerId = customers.data[0].id;
        
        const sub = await stripeInstance.subscriptions.create({
            customer: customerId,
            items: [{ price: 'price_1Sw1Wg5Br3qnfEfN4OVbYrgh', quantity: 1 }],
            payment_behavior: 'default_incomplete',
            payment_settings: { 
                save_default_payment_method: 'on_subscription',
                payment_method_types: ['card', 'sepa_debit']
            },
            expand: ['latest_invoice.payment_intent']
        });
        // console.log("Sub Status:", sub.status);
        const fs = require('fs');
        fs.writeFileSync('scripts/out.json', JSON.stringify(sub, null, 2));
        
        // Clean up
        await stripeInstance.subscriptions.cancel(sub.id);
    } catch (e) {
        console.error("Error:", e);
    }
}

testCreate();
