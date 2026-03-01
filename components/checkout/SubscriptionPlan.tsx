import React from 'react';
import { PricingCard } from '@/components/marketing/PricingCard';
import { PricingComparisonTable } from '@/components/marketing/PricingComparisonTable';
import prisma from '@/lib/prisma';

export const SubscriptionPlan = async () => {
    let plans: any[] = [];
    try {
        plans = await prisma.planTier.findMany({ orderBy: { orderIndex: 'asc' } });
    } catch (error) {
        console.error('Failed to load plans from database', error);
    }

    if (plans.length === 0) {
        return <div className="text-center p-8">No plans available.</div>;
    }

    return (
        <div className="flex flex-col gap-12 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const formattedPrice = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: plan.currency,
                    }).format(plan.priceAmount / 100);

                    const features: string[] = Array.isArray(plan.features) ? plan.features as string[] : [];

                    return (
                        <PricingCard
                            key={plan.id}
                            id={plan.stripeProductId}
                            name={plan.name}
                            description={plan.marketingDesc || ''}
                            price={formattedPrice}
                            features={features}
                            badge={plan.isPopular ? "Most Popular" : undefined}
                            href={`/checkout/hardware?product_id=${plan.stripeProductId}`}
                        />
                    );
                })}
            </div>

            <PricingComparisonTable plans={plans} />
        </div>
    );
};
