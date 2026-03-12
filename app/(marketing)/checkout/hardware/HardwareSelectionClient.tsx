"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SerializedHardwareProduct } from '@/lib/api/products';
import { useCart } from '@/contexts/CartContext';
import { PlanSummaryBox } from '@/components/marketing/checkout/hardware/PlanSummaryBox';
import { SensorGrid } from '@/components/marketing/checkout/hardware/SensorGrid';
import { StickyCheckoutBar } from '@/components/marketing/checkout/hardware/StickyCheckoutBar';

export default function HardwareSelectionClient({
    plan,
    sensors
}: {
    plan: any;
    sensors: SerializedHardwareProduct[];
}) {
    const router = useRouter();
    const { setBundle, state, grandTotal, isLoading } = useCart();

    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [hasHydrated, setHasHydrated] = useState(false);

    useEffect(() => {
        if (isLoading || hasHydrated) return;

        // Hydrate quantities from existing cart context if available, but only on first load
        if (state.items && state.items.length > 0) {
            const initialQuantities: Record<string, number> = {};
            state.items.forEach(item => {
                initialQuantities[item.product.id] = item.quantity;
            });
            setQuantities(initialQuantities);
        }
        setHasHydrated(true);
    }, [isLoading, hasHydrated, state.items]);

    const includedSensors = plan ? Number(plan.includedSensors) : 0;
    const maxSensors = plan?.maxSensors ? Number(plan.maxSensors) : Infinity;
    const extraSensorPriceAmount = plan ? Number(plan.extraSensorPriceAmount || 5000) : 5000;

    const baseSensors = sensors.filter(s => s.type === 'SENSOR_BASE');
    const totalBaseSelected = baseSensors.reduce((acc, s) => acc + (quantities[s.id] || 0), 0);
    const totalSelected = Object.values(quantities).reduce((acc, qty) => acc + qty, 0);
    const maxReached = totalSelected >= maxSensors;

    const handleQuantityChange = (sensorId: string, newQty: number) => {
        const currentQty = quantities[sensorId] || 0;
        if (newQty > currentQty && maxReached) return;
        setQuantities(prev => ({ ...prev, [sensorId]: newQty }));
    };

    // Live sync form selection to Cart Context so it's always persisted
    useEffect(() => {
        if (!plan || !hasHydrated) return;

        const cartItems = sensors
            .filter(s => (quantities[s.id] || 0) > 0)
            .map(s => ({
                product: { ...s, price: typeof s.price === 'number' ? s.price : Number(s.price) } as any,
                quantity: quantities[s.id],
            }));

        setBundle(plan, cartItems);
    }, [plan, quantities, sensors, setBundle, hasHydrated]);

    const handleContinue = () => {
        if (!plan || totalBaseSelected === 0) return;
        router.push('/checkout/summary');
    };

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
                totalPrice={grandTotal}
                isContinueDisabled={totalBaseSelected === 0}
                onContinue={handleContinue}
            />
        </div>
    );
}
