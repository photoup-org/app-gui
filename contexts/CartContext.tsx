"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { PlanTier, HardwareProduct } from '@prisma/client';
import type { CartState, CartContextType, CartItem } from '@/types/cart';
import { useCartTotals } from '@/hooks/useCartTotals';

// Extended context type to include isLoading
export interface ExtendedCartContextType extends CartContextType {
    isLoading: boolean;
}

const CartContext = createContext<ExtendedCartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<CartState>({ selectedPlan: null, items: [], extraSensorPriceAmount: 0 });
    const { lineItems, grandTotal } = useCartTotals(state);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const saved = window.localStorage.getItem('cartState');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.timestamp && (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) && parsed.state) {
                    setState(parsed.state);
                } else {
                    window.localStorage.removeItem('cartState');
                }
            }
        } catch (e) {
            console.error("Failed to parse cart state from localStorage", e);
        } finally {
            setIsHydrated(true);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isHydrated) return; // Wait for mount

        try {
            window.localStorage.setItem('cartState', JSON.stringify({ state, timestamp: Date.now() }));
        } catch (e) {
            console.error("Failed to save cart state to localStorage", e);
        }
    }, [state, isHydrated]);

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
            state, lineItems, grandTotal, isLoading,
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
