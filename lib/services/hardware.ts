import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getStripeProducts } from '@/lib/api/stripe';
import { HardwareOption } from '@/types/hardware';

export async function getHardwareCatalog(tierExtraSensorStripePriceId: string | null = null) {
    // Parallelize core data fetching
    const [stripeProducts, dbProducts] = await Promise.all([
        getStripeProducts(),
        prisma.hardwareProduct.findMany()
    ]);

    const mandatoryGatewayData = dbProducts.find(p => p.sku === 'GW-TRB142');
    const mandatoryGateway = mandatoryGatewayData ? {
        id: mandatoryGatewayData.id,
        sku: mandatoryGatewayData.sku,
        name: mandatoryGatewayData.name,
    } : null;

    let extraSensorPriceAmount = 0;
    if (tierExtraSensorStripePriceId) {
        try {
            if (tierExtraSensorStripePriceId.startsWith('prod_')) {
                const product = await stripe.products.retrieve(tierExtraSensorStripePriceId);
                const priceId = typeof product.default_price === 'string'
                    ? product.default_price
                    : (product.default_price as any)?.id;

                if (priceId) {
                    const priceObj = await stripe.prices.retrieve(priceId);
                    extraSensorPriceAmount = (priceObj.unit_amount || 0) / 100;
                }
            } else {
                const priceObj = await stripe.prices.retrieve(tierExtraSensorStripePriceId);
                extraSensorPriceAmount = (priceObj.unit_amount || 0) / 100;
            }
        } catch (e) {
            console.error("Failed to fetch extra sensor price", e);
        }
    }

    const availableHardware: HardwareOption[] = dbProducts.map(dbProd => {
        const stripeProd = stripeProducts.find(p => p.id === dbProd.stripeProductId);
        const price = stripeProd?.prices[0]?.unit_amount ? stripeProd.prices[0].unit_amount / 100 : Number(dbProd.price);
        return {
            id: dbProd.id,
            sku: dbProd.sku,
            name: dbProd.name,
            type: dbProd.type,
            price: price,
            stripePriceId: stripeProd?.prices[0]?.id || ''
        };
    });

    return {
        availableHardware,
        mandatoryGateway,
        extraSensorPriceAmount
    };
}
