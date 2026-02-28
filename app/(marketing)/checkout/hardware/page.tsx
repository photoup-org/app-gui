import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import HardwareForm from './HardwareForm';
import { getHardwareCatalog } from '@/lib/services/hardware';

export default async function HardwareSelectionPage(props: { searchParams: Promise<{ plan_id?: string }> }) {
    const searchParams = await props.searchParams;
    const planId = searchParams.plan_id;

    if (!planId) {
        redirect('/pricing');
    }

    const tier = await prisma.planTier.findUnique({
        where: { stripePlanPriceId: planId }
    });

    if (!tier) {
        redirect('/pricing');
    }

    const { availableHardware, mandatoryGateway, extraSensorPriceAmount } = await getHardwareCatalog(tier.extraSensorStripePriceId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <HardwareForm
                    tier={tier}
                    planId={planId}
                    availableHardware={availableHardware}
                    mandatoryGateway={mandatoryGateway}
                    extraSensorPriceAmount={extraSensorPriceAmount}
                />
            </div>
        </div>
    );
}
