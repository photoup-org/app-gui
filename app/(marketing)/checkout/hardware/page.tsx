import React from 'react';
import { redirect } from 'next/navigation';
import { getPlanTierByProductId } from '@/lib/api/plans';
import HardwareForm from './HardwareForm';
import { getHardwareCatalog } from '@/lib/services/hardware';

export default async function HardwareSelectionPage(props: { searchParams: Promise<{ product_id?: string }> }) {
    const searchParams = await props.searchParams;
    const productId = searchParams.product_id;

    if (!productId) {
        redirect('/pricing');
    }

    const tier = await getPlanTierByProductId(productId);

    if (!tier) {
        redirect('/pricing');
    }

    const { availableHardware, mandatoryGateway, extraSensorPriceAmount } = await getHardwareCatalog(tier.extraSensorStripePriceId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <HardwareForm
                    tier={tier}
                    planId={productId}
                    availableHardware={availableHardware}
                    mandatoryGateway={mandatoryGateway}
                    extraSensorPriceAmount={extraSensorPriceAmount}
                />
            </div>
        </div>
    );
}
