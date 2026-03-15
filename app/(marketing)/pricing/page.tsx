import prisma from "@/lib/prisma";
import { PlanFeatureMatrix } from "@/types/pricing";
import { PricingCards } from "@/components/marketing/pricing/PricingCards";
import { ComparisonTable } from "@/components/marketing/pricing/ComparisonTable";
import MainPageSection from "@/components/marketing/MainPageSection";
import TitleComponent from "@/components/marketing/pricing/TitleComponent";
import { Suspense } from 'react';
import { PricingCartFeedback } from '@/components/marketing/pricing/PricingCartFeedback';
import { PricingCartBanner } from '@/components/marketing/pricing/PricingCartBanner';

export default async function PricingPage() {
    const plansData = await prisma.planTier.findMany({
        orderBy: { orderIndex: "asc" },
    });

    // Calculate prices and parse matrix
    const parsedPlans = plansData.map((plan) => {
        const annualPrice = plan.priceAmount / 100;
        const monthlyPrice = Math.round(annualPrice / 12);

        // Safely parse uiFeatureMatrix
        let matrix: PlanFeatureMatrix = { cardFeatures: [], tableCategories: [] };
        if (plan.uiFeatureMatrix) {
            try {
                if (typeof plan.uiFeatureMatrix === 'string') {
                    matrix = JSON.parse(plan.uiFeatureMatrix) as PlanFeatureMatrix;
                } else {
                    matrix = plan.uiFeatureMatrix as unknown as PlanFeatureMatrix;
                }
            } catch (e) {
                console.error("Failed to parse uiFeatureMatrix for plan", plan.id, e);
            }
        }

        return {
            ...plan,
            annualPrice,
            monthlyPrice,
            matrix,
        };
    });

    return (
        <>
            <PricingCartBanner />
            <Suspense fallback={null}>
                <PricingCartFeedback />
            </Suspense>
            <MainPageSection className="flex flex-col gap-20 items-center w-full">
                <TitleComponent />
                <PricingCards plans={parsedPlans} />
                <div className="mt-24 w-full">
                    <ComparisonTable plans={parsedPlans} />
                </div>
            </MainPageSection>
        </>
    );
}
