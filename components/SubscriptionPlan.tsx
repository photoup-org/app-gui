'use client';

import React, { useEffect, useState } from 'react';
import { PricingCard } from './PricingCard';
import { getStripeProducts } from '@/app/actions/stripe';
import { useRouter } from 'next/navigation';

interface Product {
    id: string;
    name: string;
    description: string | null;
    prices: {
        id: string;
        unit_amount: number | null;
        currency: string;
    }[];
}

export const SubscriptionPlan = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getStripeProducts();
                setProducts(data);
            } catch (error) {
                console.error('Failed to load products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleSelectPlan = (priceId: string) => {
        // Direct redirect to checkout with plan_id
        router.push(`/checkout?plan_id=${priceId}`);
    };

    if (loading) {
        return <div className="text-center p-8">Loading plans...</div>;
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
                        name={product.name}
                        description={product.description || ''}
                        price={formattedPrice}
                        onSelect={() => handleSelectPlan(price.id)}
                    />
                );
            })}
        </div>
    );
};
