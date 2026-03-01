import { stripe } from '@/lib/stripe';

export async function getStripeLineItemsConfig(
    lineItems: { price: string; quantity?: number }[],
    tierExtraSensorStripePriceId: string | null,
    extraSensorsCount: number,
    selectedHardware: { stripePriceId?: string; quantity: number; type?: string }[]
) {
    // 1. Process base line items concurrently
    const lineItemDetails = await Promise.all(
        lineItems.map(async (item) => {
            const price = await stripe.prices.retrieve(item.price);
            return { item, price };
        })
    );

    const recurringItems = lineItemDetails
        .filter(d => d.price.type === 'recurring')
        .map(d => d.item);

    const invoiceLineItems = lineItemDetails
        .filter(d => d.price.type !== 'recurring')
        .map(d => ({
            item: d.item,
            amount: (d.price.unit_amount || 0) * (d.item.quantity || 1)
        }));

    let totalOneTimeAmount = invoiceLineItems.reduce((sum, current) => sum + current.amount, 0);
    const addInvoiceItems = invoiceLineItems.map(d => d.item);

    // 2. Extra sensors
    if (extraSensorsCount > 0 && tierExtraSensorStripePriceId) {
        let actualPriceId = tierExtraSensorStripePriceId;
        if (tierExtraSensorStripePriceId.startsWith('prod_')) {
            const product = await stripe.products.retrieve(tierExtraSensorStripePriceId);
            actualPriceId = typeof product.default_price === 'string'
                ? product.default_price
                : ((product.default_price as any)?.id || tierExtraSensorStripePriceId);
        }

        addInvoiceItems.push({ price: actualPriceId, quantity: extraSensorsCount });
        const extraSensorsPrice = await stripe.prices.retrieve(actualPriceId);
        totalOneTimeAmount += (extraSensorsPrice.unit_amount || 0) * extraSensorsCount;
    }

    // 3. Hardware gateways processed concurrently
    const hwPromises = selectedHardware.filter(hw => hw.type === 'GATEWAY' && hw.stripePriceId).map(async hw => {
        const gwPrice = await stripe.prices.retrieve(hw.stripePriceId!);
        return {
            item: { price: hw.stripePriceId!, quantity: hw.quantity },
            amount: (gwPrice.unit_amount || 0) * hw.quantity
        };
    });

    const hwResults = await Promise.all(hwPromises);
    for (const res of hwResults) {
        addInvoiceItems.push(res.item);
        totalOneTimeAmount += res.amount;
    }

    return {
        recurringItems,
        addInvoiceItems,
        totalOneTimeAmount
    };
}
