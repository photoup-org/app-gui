'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { HardwareOption } from '@/types/hardware';

const SensorIcon = () => (
    <div className="flex flex-col items-center">
        <svg className="w-8 h-8 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <span className="opacity-50">Image Placeholder</span>
    </div>
);

const GatewayIcon = () => (
    <div className="bg-gray-100 dark:bg-zinc-800 h-16 w-16 flex items-center justify-center rounded-md text-gray-400 text-xs shrink-0">
        <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
    </div>
);

export default function HardwareForm({
    tier,
    planId,
    availableHardware = [],
    mandatoryGateway,
    extraSensorPriceAmount = 0
}: {
    tier: any;
    planId: string;
    availableHardware?: HardwareOption[];
    mandatoryGateway?: any;
    extraSensorPriceAmount?: number;
}) {
    const [cart, setCart] = useState<Record<string, number>>({});
    const router = useRouter();

    // 1. STRATEGIC MEMOIZATION: Only re-filter the array if the master catalog actually changes.
    const sensorsOnly = useMemo(() =>
        availableHardware.filter(h => h.type === 'SENSOR_BASE' || h.type === 'SENSOR_PREMIUM'),
        [availableHardware]);

    const gatewaysOnly = useMemo(() =>
        availableHardware.filter(h => h.type === 'GATEWAY'),
        [availableHardware]);

    // 2. STRATEGIC MEMOIZATION: Math reduction involving object lookups.
    // Only runs when the 'cart' explicitly changes.
    const totalSensorsInCart = useMemo(() => {
        return Object.entries(cart).reduce((sum, [id, qty]) => {
            const isSensor = sensorsOnly.some(s => s.id === id);
            return isSensor ? sum + qty : sum;
        }, 0);
    }, [cart, sensorsOnly]);

    const isAtLimit = tier?.maxSensors !== null && totalSensorsInCart >= (tier?.maxSensors || 0);

    // 3. USECALLBACK: Stabilize cart modification handlers
    const handleIncrement = useCallback((id: string, isSensor: boolean) => {
        if (isSensor && isAtLimit) return;
        setCart(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + 1
        }));
    }, [isAtLimit]);

    const handleDecrement = useCallback((id: string) => {
        setCart(prev => {
            const current = prev[id] || 0;
            if (current <= 0) return prev;
            const updated = { ...prev };
            updated[id] = current - 1;
            if (updated[id] === 0) delete updated[id];
            return updated;
        });
    }, []);

    // 4. USECALLBACK: Stabilize form submission handler
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const selectedHardware = Object.entries(cart)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => {
                const hw = availableHardware.find(h => h.id === id);
                return {
                    productId: id,
                    quantity: qty,
                    stripePriceId: hw?.stripePriceId,
                    type: hw?.type
                };
            });

        const encodedHardware = encodeURIComponent(JSON.stringify(selectedHardware));
        router.push(`/checkout?plan_id=${planId}&hardware=${encodedHardware}&totalSensors=${totalSensorsInCart}`);
    }, [cart, availableHardware, planId, totalSensorsInCart, router]);

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 shadow sm:rounded-lg p-6 sm:p-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Hardware Selection</h2>

                <div className="mb-8 border-b border-gray-200 dark:border-zinc-700 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Included in {tier?.name} Plan</h3>
                    <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
                        <li>1x Gateway {mandatoryGateway?.name || 'Teltonika TRB142'} ({mandatoryGateway?.sku || 'GW-TRB142'})</li>
                        <li>{tier?.includedSensors}x Base Sensors</li>
                    </ul>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sensors</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Build your monitoring network.
                        (Included: {tier?.includedSensors} | Max: {tier?.maxSensors === null ? 'Unlimited' : tier?.maxSensors})
                    </p>

                    {isAtLimit && (
                        <div className="mb-4 p-4 text-sm text-yellow-800 bg-yellow-50 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-200">
                            You have reached the maximum sensor capacity for this plan. Please consider upgrading your plan for more capacity.
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sensorsOnly.map(hw => {
                            const qty = cart[hw.id] || 0;
                            const displayPrice = totalSensorsInCart < (tier?.includedSensors || 0)
                                ? "0 € (Included)"
                                : `${extraSensorPriceAmount} € / each`;

                            return (
                                <div key={hw.id} className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col h-full hover:shadow-md transition-shadow">
                                    <div className="bg-gray-100 dark:bg-zinc-800 h-32 w-full flex items-center justify-center rounded-md mb-4 text-gray-400 dark:text-gray-500 text-sm overflow-hidden">
                                        <SensorIcon />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1" title={hw.name}>{hw.name}</h4>
                                        <p className="text-xs text-gray-500 mb-2 font-mono">{hw.sku}</p>
                                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4">{displayPrice}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-zinc-800">
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleDecrement(hw.id)} disabled={qty <= 0}>-</Button>
                                        <span className="text-lg font-semibold dark:text-zinc-100 w-8 text-center">{qty}</span>
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleIncrement(hw.id, true)} disabled={isAtLimit}>+</Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Extra Gateways</h3>
                    <p className="text-sm text-gray-500 mb-4">Add extra gateways if you need monitoring coverage in separate locations.</p>

                    <div className="space-y-4">
                        {gatewaysOnly.map(hw => {
                            const qty = cart[hw.id] || 0;
                            return (
                                <div key={hw.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 dark:border-zinc-800 p-4 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                                        <GatewayIcon />
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{hw.name}</h4>
                                            <p className="text-xs text-gray-500 font-mono mb-1">{hw.sku}</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-300">{hw.price} € / each</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 self-start sm:self-auto">
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleDecrement(hw.id)} disabled={qty <= 0}>-</Button>
                                        <span className="text-lg font-semibold dark:text-zinc-100 w-8 text-center">{qty}</span>
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleIncrement(hw.id, false)}>+</Button>
                                    </div>
                                </div>
                            );
                        })}
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
