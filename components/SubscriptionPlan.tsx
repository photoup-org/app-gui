import React from 'react';
import { PricingCard } from './PricingCard';
import { getStripeProducts } from '@/app/actions/stripe';
import { Product } from '@/types/stripe';

export const SubscriptionPlan = async () => {
    let products: Product[] = [];
    try {
        products = await getStripeProducts();
    } catch (error) {
        console.error('Failed to load products', error);
    }

    if (products.length === 0) {
        return <div className="text-center p-8">No plans available.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {products.map((product) => {
                const price = product.prices[0]; // Assuming one price per product for simplicity
                if (!price || price.unit_amount === null) return null;

                const formattedPrice = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: price.currency,
                }).format(price.unit_amount / 100);

                return (
                    <PricingCard
                        key={product.id}
                        id={price.id}
                        name={product.name}
                        description={product.description || ''}
                        price={formattedPrice}
                        href={`/checkout/hardware?plan_id=${price.id}`}
                    />
                );
            })}
        </div>
    );
};
