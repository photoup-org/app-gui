"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getPlanAndSensors } from '@/actions/checkout';
import type { SerializedHardwareProduct } from '@/lib/api/products';
import { useCart } from '@/contexts/CartContext';
import { PlanSummaryBox } from '@/components/marketing/checkout/hardware/PlanSummaryBox';
import { SensorGrid } from '@/components/marketing/checkout/hardware/SensorGrid';
import { StickyCheckoutBar } from '@/components/marketing/checkout/hardware/StickyCheckoutBar';

export default function HardwareSelectionClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productId = searchParams.get('product_id');
    const { setBundle } = useCart();

    const [plan, setPlan] = useState<any>(null);
    const [sensors, setSensors] = useState<SerializedHardwareProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const [quantities, setQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!productId) {
            router.push('/pricing');
            return;
        }

        async function fetchData() {
            setLoading(true);
            const data = await getPlanAndSensors(productId as string);
            if (!data.plan) {
                router.push('/pricing');
                return;
            }
            setPlan(data.plan);
            setSensors(data.sensors);
            setLoading(false);
        }

        fetchData();
    }, [productId, router]);

    const planBasePrice = plan ? Number(plan.priceAmount) : 0;
    const includedSensors = plan ? Number(plan.includedSensors) : 0;
    const maxSensors = plan?.maxSensors ? Number(plan.maxSensors) : Infinity;
    const extraSensorPriceAmount = plan ? Number(plan.extraSensorPriceAmount || 5000) : 5000;

    const baseSensors = sensors.filter(s => s.type === 'SENSOR_BASE');
    const totalBaseSelected = baseSensors.reduce((acc, s) => acc + (quantities[s.id] || 0), 0);
    const totalSelected = Object.values(quantities).reduce((acc, qty) => acc + qty, 0);
    const maxReached = totalSelected >= maxSensors;

    // Total price calculation mapping exactly to useCartTotals
    const totalPrice = useMemo(() => {
        let total = planBasePrice;

        const premiumSensors = sensors.filter(s => s.type === 'SENSOR_PREMIUM');
        premiumSensors.forEach(s => {
            total += (quantities[s.id] || 0) * (s.price);
        });

        let remainingFree = includedSensors;
        baseSensors.forEach(s => {
            const qty = quantities[s.id] || 0;
            if (remainingFree > 0) {
                const freeAmount = Math.min(qty, remainingFree);
                const paidAmount = qty - freeAmount;
                remainingFree -= freeAmount;
                if (paidAmount > 0) {
                    total += paidAmount * (extraSensorPriceAmount);
                }
            } else {
                total += qty * (extraSensorPriceAmount);
            }
        });

        return total;
    }, [quantities, sensors, planBasePrice, includedSensors, extraSensorPriceAmount]);

    const handleQuantityChange = (sensorId: string, newQty: number) => {
        const currentQty = quantities[sensorId] || 0;
        if (newQty > currentQty && maxReached) return;
        setQuantities(prev => ({ ...prev, [sensorId]: newQty }));
    };

    // Live sync form selection to Cart Context so it's always persisted
    useEffect(() => {
        if (!plan) return;
        
        const cartItems = sensors
            .filter(s => (quantities[s.id] || 0) > 0)
            .map(s => ({
                product: { ...s, price: typeof s.price === 'number' ? s.price : Number(s.price) } as any,
                quantity: quantities[s.id],
            }));

        setBundle(plan, cartItems);
    }, [plan, quantities, sensors, setBundle]);

    const handleContinue = () => {
        if (!plan || totalBaseSelected === 0) return;
        router.push('/checkout/summary');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] gap-3">
                <span className="w-5 h-5 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin"></span>
                <span className="text-slate-600 dark:text-gray-400">A carregar configuração...</span>
            </div>
        );
    }

    return (
        <div className="relative">
            <PlanSummaryBox
                planName={plan?.name || ''}
                includedSensors={includedSensors}
                totalBaseSelected={totalBaseSelected}
                maxSensors={maxSensors}
            />

            <SensorGrid
                sensors={sensors}
                baseSensors={baseSensors}
                quantities={quantities}
                includedSensors={includedSensors}
                extraSensorPriceAmount={extraSensorPriceAmount}
                maxReached={maxReached}
                onQuantityChange={handleQuantityChange}
            />

            <StickyCheckoutBar
                totalPrice={totalPrice}
                isContinueDisabled={totalBaseSelected === 0}
                onContinue={handleContinue}
            />
        </div>
    );
}
