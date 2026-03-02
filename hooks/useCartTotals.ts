import { useMemo } from 'react';
import type { CartState, LineItem } from '@/types/cart';

export function useCartTotals(state: CartState) {
    return useMemo(() => {
        const lineItems: LineItem[] = [];
        let grandTotal = 0;

        // 1. Plan Subscription
        if (state.selectedPlan) {
            lineItems.push({
                id: `plan-${state.selectedPlan.id}`,
                productId: state.selectedPlan.id,
                name: `Plan: ${state.selectedPlan.name}`,
                price: Number(state.selectedPlan.priceAmount),
                quantity: 1,
                isIncluded: false,
            });
            grandTotal += Number(state.selectedPlan.priceAmount);
        }

        const planGateways = state.selectedPlan?.includedGateways || 0;
        const planSensors = state.selectedPlan?.includedSensors || 0;

        const gateways = state.items.filter((i) => i.product.type === 'GATEWAY');
        const baseSensors = state.items.filter((i) => i.product.type === 'SENSOR_BASE');
        const premiumSensors = state.items.filter((i) => i.product.type === 'SENSOR_PREMIUM');

        // 2. Gateways
        let totalGateways = gateways.reduce((acc, item) => acc + item.quantity, 0);
        if (totalGateways > 0) {
            let remainingFreeGateways = planGateways;

            gateways.forEach(item => {
                const productPrice = Number(item.product.price) * 100; // Convert Euros to Cents

                if (remainingFreeGateways > 0) {
                    const freeAmount = Math.min(item.quantity, remainingFreeGateways);
                    const paidAmount = item.quantity - freeAmount;

                    lineItems.push({
                        id: `free-gateway-${item.product.id}`,
                        productId: item.product.id,
                        name: `${freeAmount}x ${item.product.name}`,
                        price: 0,
                        quantity: freeAmount,
                        isIncluded: true,
                    });

                    remainingFreeGateways -= freeAmount;

                    if (paidAmount > 0) {
                        const itemsPrice = paidAmount * productPrice;
                        lineItems.push({
                            id: `paid-gateway-${item.product.id}`,
                            productId: item.product.id,
                            name: `${paidAmount}x ${item.product.name} (Extra)`,
                            price: itemsPrice,
                            quantity: paidAmount,
                            isIncluded: false,
                        });
                        grandTotal += itemsPrice;
                    }
                } else {
                    const itemsPrice = item.quantity * productPrice;
                    lineItems.push({
                        id: `paid-gateway-${item.product.id}`,
                        productId: item.product.id,
                        name: `${item.quantity}x ${item.product.name} (Extra)`,
                        price: itemsPrice,
                        quantity: item.quantity,
                        isIncluded: false,
                    });
                    grandTotal += itemsPrice;
                }
            });
        }

        // 3. Base Sensors
        let totalBaseSensors = baseSensors.reduce((acc, item) => acc + item.quantity, 0);
        if (totalBaseSensors > 0) {
            let remainingFreeSensors = planSensors;

            baseSensors.forEach(item => {
                // IMPORTANT: Base Sensors never use their intrinsic database price (which is €0)
                // When we exceed the quota, we must charge the plan's specific Extra Add-on rate.
                const extraSensorPriceCents = state.extraSensorPriceAmount * 100; // Convert Euros to Cents

                if (remainingFreeSensors > 0) {
                    const freeAmount = Math.min(item.quantity, remainingFreeSensors);
                    const paidAmount = item.quantity - freeAmount;

                    lineItems.push({
                        id: `free-sensor-base-${item.product.id}`,
                        productId: item.product.id,
                        name: `${freeAmount}x ${item.product.name}`,
                        price: 0,
                        quantity: freeAmount,
                        isIncluded: true,
                    });

                    remainingFreeSensors -= freeAmount;

                    if (paidAmount > 0) {
                        const itemsPrice = paidAmount * extraSensorPriceCents;
                        lineItems.push({
                            id: `paid-sensor-base-${item.product.id}`,
                            productId: item.product.id,
                            name: `${paidAmount}x ${item.product.name} (Extra Add-on)`,
                            price: itemsPrice,
                            quantity: paidAmount,
                            isIncluded: false,
                        });
                        grandTotal += itemsPrice;
                    }
                } else {
                    const itemsPrice = item.quantity * extraSensorPriceCents;
                    lineItems.push({
                        id: `paid-sensor-base-${item.product.id}`,
                        productId: item.product.id,
                        name: `${item.quantity}x ${item.product.name} (Extra Add-on)`,
                        price: itemsPrice,
                        quantity: item.quantity,
                        isIncluded: false,
                    });
                    grandTotal += itemsPrice;
                }
            });
        }

        // 4. Premium Sensors (NEVER use free quota)
        premiumSensors.forEach(item => {
            const productPrice = Number(item.product.price) * 100; // Convert Euros to Cents
            const itemsPrice = item.quantity * productPrice;
            lineItems.push({
                id: `paid-sensor-premium-${item.product.id}`,
                productId: item.product.id,
                name: `${item.quantity}x ${item.product.name}`,
                price: itemsPrice,
                quantity: item.quantity,
                isIncluded: false,
            });
            grandTotal += itemsPrice;
        });

        return { lineItems, grandTotal };
    }, [state]);
}
