'use client';

import React, { useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { HardwareOption } from '@/types/hardware';
import { useCart } from '@/contexts/CartContext';

const SensorIcon = () => (
    <div className="flex flex-col items-center">
        <svg className="w-8 h-8 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <span className="opacity-50">Image Placeholder</span>
    </div>
);

const GatewayIcon = () => (
    <div className="bg-muted h-16 w-16 flex items-center justify-center rounded-md text-muted-foreground text-xs shrink-0">
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
    const { state, updateQuantity, addItem, removeItem, setExtraSensorPrice, setPlan } = useCart();

    // 0. Initialize the Cart Context with the Plan and specific overage price
    React.useEffect(() => {
        if (tier && (!state.selectedPlan || state.selectedPlan.id !== tier.id)) {
            setPlan(tier);
        }
        if (extraSensorPriceAmount > 0 && state.extraSensorPriceAmount !== extraSensorPriceAmount) {
            setExtraSensorPrice(extraSensorPriceAmount);
        }
    }, [tier, extraSensorPriceAmount, state.selectedPlan, state.extraSensorPriceAmount, setPlan, setExtraSensorPrice]);

    const getQty = useCallback((id: string) => {
        return state.items.find(i => i.product.id === id)?.quantity || 0;
    }, [state.items]);

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
        return state.items.reduce((sum, item) => {
            const isSensor = item.product.type === 'SENSOR_BASE' || item.product.type === 'SENSOR_PREMIUM';
            return isSensor ? sum + item.quantity : sum;
        }, 0);
    }, [state.items]);

    const totalBaseSensorsInCart = useMemo(() => {
        return state.items.reduce((sum, item) => {
            const isBaseSensor = item.product.type === 'SENSOR_BASE';
            return isBaseSensor ? sum + item.quantity : sum;
        }, 0);
    }, [state.items]);

    const isAtLimit = tier?.maxSensors !== null && totalSensorsInCart >= (tier?.maxSensors || 0);

    // 3. USECALLBACK: Stabilize cart modification handlers
    const handleIncrement = useCallback((hw: any, isSensor: boolean) => {
        if (isSensor && isAtLimit) return;
        const currentQty = getQty(hw.id);
        if (currentQty === 0) {
            console.log('Adding item:', hw);
            addItem({
                id: hw.id,
                name: hw.name,
                price: hw.price,
                type: hw.type,
                sku: hw.sku
            } as any, 1, hw.stripePriceId);
        } else {
            console.log('Updating item quantity:', hw.name, currentQty + 1);
            updateQuantity(hw.id, currentQty + 1);
        }
    }, [isAtLimit, getQty, addItem, updateQuantity]);

    const handleDecrement = useCallback((hw: any) => {
        const currentQty = getQty(hw.id);
        if (currentQty <= 0) return;
        if (currentQty === 1) {
            console.log('Removing item:', hw.name);
            removeItem(hw.id);
        } else {
            console.log('Updating item quantity:', hw.name, currentQty - 1);
            updateQuantity(hw.id, currentQty - 1);
        }
    }, [getQty, removeItem, updateQuantity]);

    return (
        <div className="space-y-8">
            <div className="bg-background shadow sm:rounded-lg p-6 sm:p-10">
                <h2 className="text-2xl font-bold text-foreground mb-6">Hardware Selection</h2>

                <div className="mb-8 border-b border-border pb-6">
                    <h3 className="text-lg font-medium text-foreground mb-2">Included in {tier?.name} Plan</h3>
                    <ul className="list-disc pl-5 text-muted-foreground">
                        <li>1x Gateway {mandatoryGateway?.name || 'Teltonika TRB142'} ({mandatoryGateway?.sku || 'GW-TRB142'})</li>
                        <li>{tier?.includedSensors}x Base Sensors</li>
                    </ul>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-medium text-foreground mb-2">Sensors</h3>
                    <p className="text-sm text-muted-foreground mb-4">
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
                            const qty = getQty(hw.id);

                            let displayPrice = '';
                            if (hw.type === 'SENSOR_PREMIUM') {
                                displayPrice = `${hw.price} € / each`;
                            } else {
                                displayPrice = totalBaseSensorsInCart < (tier?.includedSensors || 0)
                                    ? "0 € (Included)"
                                    : `${extraSensorPriceAmount} € / each`;
                            }

                            return (
                                <div key={hw.id} className="border border-border rounded-lg p-4 flex flex-col h-full hover:shadow-md transition-shadow">
                                    <div className="bg-muted h-32 w-full flex items-center justify-center rounded-md mb-4 text-muted-foreground text-sm overflow-hidden">
                                        <SensorIcon />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-foreground line-clamp-1" title={hw.name}>{hw.name}</h4>
                                        <p className="text-xs text-muted-foreground mb-2 font-mono">{hw.sku}</p>
                                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4">{displayPrice}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleDecrement(hw)} disabled={qty <= 0}>-</Button>
                                        <span className="text-lg font-semibold text-foreground w-8 text-center">{qty}</span>
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleIncrement(hw, true)} disabled={isAtLimit}>+</Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-medium text-foreground mb-2">Extra Gateways</h3>
                    <p className="text-sm text-muted-foreground mb-4">Add extra gateways if you need monitoring coverage in separate locations.</p>

                    <div className="space-y-4">
                        {gatewaysOnly.map(hw => {
                            const qty = getQty(hw.id);
                            return (
                                <div key={hw.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-border p-4 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                                        <GatewayIcon />
                                        <div>
                                            <h4 className="font-semibold text-foreground">{hw.name}</h4>
                                            <p className="text-xs text-muted-foreground font-mono mb-1">{hw.sku}</p>
                                            <p className="text-sm font-medium text-foreground">{hw.price} € / each</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 self-start sm:self-auto">
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleDecrement(hw)} disabled={qty <= 0}>-</Button>
                                        <span className="text-lg font-semibold text-foreground w-8 text-center">{qty}</span>
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleIncrement(hw, false)}>+</Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
