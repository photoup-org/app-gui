"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import type { PlanTier, HardwareProduct } from '@prisma/client';
import type { CartState, CartItem } from '@/types/cart';
import { useCartTotals } from '@/hooks/useCartTotals';
import type { LineItem } from '@/types/cart';

export interface CartStateContextType {
    state: CartState;
    lineItems: LineItem[];
    grandTotal: number;
    isLoading: boolean;
}

export interface CartDispatchContextType {
    setPlan: (plan: PlanTier) => void;
    setBundle: (plan: PlanTier | null, items: CartItem[]) => void;
    setExtraSensorPrice: (price: number) => void;
    addItem: (product: HardwareProduct, quantity: number, stripePriceId?: string) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
}

const CartStateContext = createContext<CartStateContextType | undefined>(undefined);
const CartDispatchContext = createContext<CartDispatchContextType | undefined>(undefined);

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

    const dispatchValue = useMemo(() => ({
        setPlan, setBundle, setExtraSensorPrice, addItem, removeItem, updateQuantity, clearCart
    }), [setPlan, setBundle, setExtraSensorPrice, addItem, removeItem, updateQuantity, clearCart]);

    const stateValue = useMemo(() => ({
        state, lineItems, grandTotal, isLoading
    }), [state, lineItems, grandTotal, isLoading]);

    return (
        <CartDispatchContext.Provider value={dispatchValue}>
            <CartStateContext.Provider value={stateValue}>
                {children}
            </CartStateContext.Provider>
        </CartDispatchContext.Provider>
    );
}

export function useCartState() {
    const context = useContext(CartStateContext);
    if (context === undefined) {
        throw new Error('useCartState must be used within a CartProvider');
    }
    return context;
}

export function useCartDispatch() {
    const context = useContext(CartDispatchContext);
    if (context === undefined) {
        throw new Error('useCartDispatch must be used within a CartProvider');
    }
    return context;
}

export function useCart() {
    const stateContext = useContext(CartStateContext);
    const dispatchContext = useContext(CartDispatchContext);
    
    if (stateContext === undefined || dispatchContext === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    
    return {
        ...stateContext,
        ...dispatchContext
    };
}
