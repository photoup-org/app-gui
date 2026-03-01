require('dotenv').config({ path: '.env.local' });
const stripeInstance = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkSub() {
    try {
        const invoices = await stripeInstance.invoices.list({ limit: 5 });
        const inc = invoices.data[0];
        console.log("Latest Invoice ID:", inc.id);
        console.log("Amount Due:", inc.amount_due);
        console.log("Amount Paid:", inc.amount_paid);
        console.log("Status:", inc.status);
        console.log("Payment Intent:", inc.payment_intent);
        
        const sub = await stripeInstance.subscriptions.retrieve(inc.subscription);
        console.log("Sub Status:", sub.status);
        console.log("Sub Trial Start:", sub.trial_start);
        console.log("Sub Trial End:", sub.trial_end);
        console.log("Sub Pending Setup Intent:", sub.pending_setup_intent);
    } catch (e) {
        console.error(e);
    }
}

checkSub();
