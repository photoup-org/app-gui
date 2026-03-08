import { stripe } from '@/lib/stripe';
import { Product } from '@/types/stripe';

export async function getStripeProducts(): Promise<Product[]> {
    try {
        const products = await stripe.products.list({
            active: true,
            expand: ['data.default_price'],
            limit: 100,
        });

        const prices = await stripe.prices.list({
            active: true,
            type: 'recurring',
            limit: 100,
        });

        // Map prices to products
        const productsWithPrices = products.data.map((product) => {
            const productPrices = prices.data.filter((price) => price.product === product.id);

            // Serialize for client components
            return {
                id: product.id,
                name: product.name,
                description: product.description,
                prices: productPrices.map(p => ({
                    id: p.id,
                    unit_amount: p.unit_amount,
                    currency: p.currency,
                }))
            };
        });

        return productsWithPrices;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}
