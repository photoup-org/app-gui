import { PricingCard } from '@/components/marketing/pricing/PricingCard';
import { PricingComparisonTable } from '@/components/marketing/pricing/PricingComparisonTable';
import { getPlanTiers } from '@/lib/api/plans';

export const SubscriptionPlan = async () => {
    const plans = await getPlanTiers();

    if (plans.length === 0) {
        return <div className="text-center p-8">No plans available.</div>;
    }

    return (
        <div className="flex flex-col gap-12 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((p) => {
                    const plan = p as any;
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
                            plan={plan}
                        />
                    );
                })}
            </div>

            <PricingComparisonTable plans={plans} />
        </div>
    );
};
