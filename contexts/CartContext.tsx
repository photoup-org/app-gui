"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { PlanTier, HardwareProduct } from '@prisma/client';
import type { CartState, CartContextType, CartItem } from '@/types/cart';
import { useCartTotals } from '@/hooks/useCartTotals';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<CartState>({ selectedPlan: null, items: [], extraSensorPriceAmount: 0 });
    const { lineItems, grandTotal } = useCartTotals(state);

    const setPlan = useCallback((plan: PlanTier) => {
        setState((prev) => ({ ...prev, selectedPlan: plan }));
    }, []);

    const setBundle = useCallback((plan: PlanTier | null, items: CartItem[]) => {
        setState((prev) => ({
            ...prev,
            selectedPlan: plan,
            items: items,
        }));
    }, []);

    const setExtraSensorPrice = useCallback((price: number) => {
        setState((prev) => ({ ...prev, extraSensorPriceAmount: price }));
    }, []);

    const addItem = useCallback((product: HardwareProduct, quantity: number, stripePriceId?: string) => {
        setState((prev) => {
            const existing = prev.items.find((i) => i.product.id === product.id);
            if (existing) {
                return {
                    ...prev,
                    items: prev.items.map((i) =>
                        i.product.id === product.id
                            ? { ...i, quantity: i.quantity + quantity, stripePriceId }
                            : i
                    ),
                };
            }
            return { ...prev, items: [...prev.items, { product, quantity, stripePriceId }] };
        });
    }, []);

    const removeItem = useCallback((productId: string) => {
        setState((prev) => ({
            ...prev,
            items: prev.items.filter((i) => i.product.id !== productId),
        }));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        setState((prev) => ({
            ...prev,
            items: prev.items.map((i) =>
                i.product.id === productId ? { ...i, quantity } : i
            ),
        }));
    }, []);

    const clearCart = useCallback(() => {
        setState(prev => ({
            ...prev,
            selectedPlan: null,
            items: prev.items.filter(item => item.product.type !== 'GATEWAY' && item.product.type !== 'SENSOR_BASE' && item.product.type !== 'SENSOR_PREMIUM'),
        }));

        setState({ selectedPlan: null, items: [], extraSensorPriceAmount: 0 });
    }, []);

    return (
        <CartContext.Provider value={{
            state, lineItems, grandTotal,
            setPlan, setBundle, setExtraSensorPrice, addItem, removeItem, updateQuantity, clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
