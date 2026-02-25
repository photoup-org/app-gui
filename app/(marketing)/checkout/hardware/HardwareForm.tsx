'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function HardwareForm({ tier, planId }: { tier: any, planId: string }) {
    const [extraSensorsCount, setExtraSensorsCount] = useState(0);
    const router = useRouter();

    const handleIncrement = () => {
        if (tier.maxSensors === null || tier.includedSensors + extraSensorsCount < tier.maxSensors) {
            setExtraSensorsCount((prev: number) => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (extraSensorsCount > 0) {
            setExtraSensorsCount((prev: number) => prev - 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/checkout?plan_id=${planId}&extra_sensors=${extraSensorsCount}`);
    };

    const currentTotal = tier.includedSensors + extraSensorsCount;
    const canIncrement = tier.maxSensors === null || currentTotal < tier.maxSensors;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 shadow sm:rounded-lg p-6 sm:p-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Hardware Selection</h2>

                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Included in {tier.name} Plan</h3>
                    <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
                        <li>{tier.includedGateways}x Gateway</li>
                        <li>{tier.includedSensors}x Sensors</li>
                    </ul>
                </div>

                <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Additional Sensors</h3>
                    <p className="text-sm text-gray-500 mb-4">You can add extra sensors to your workspace. (Max allowed: {tier.maxSensors === null ? 'Unlimited' : tier.maxSensors})</p>

                    <div className="flex items-center space-x-4">
                        <Button type="button" variant="outline" onClick={handleDecrement} disabled={extraSensorsCount <= 0}>-</Button>
                        <span className="text-xl font-semibold dark:text-zinc-100 w-8 text-center">{extraSensorsCount}</span>
                        <Button type="button" variant="outline" onClick={handleIncrement} disabled={!canIncrement}>+</Button>
                    </div>
                </div>

                <div className="pt-8">
                    <Button type="submit" className="w-full text-lg py-6">
                        Continue to Checkout
                    </Button>
                </div>
            </div>
        </form>
    );
}
