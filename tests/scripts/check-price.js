require('dotenv').config({ path: '.env.local' });
const stripeInstance = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkPrice() {
    try {
        const price = await stripeInstance.prices.retrieve('price_1Sw1Wg5Br3qnfEfN4OVbYrgh');
        console.log("Price Amount:", price.unit_amount);
        console.log("Currency:", price.currency);
        console.log("Type:", price.type);
    } catch (e) {
        console.error(e);
    }
}

checkPrice();
