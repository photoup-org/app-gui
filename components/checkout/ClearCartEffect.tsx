'use client';

import { useEffect } from 'react';
import { useCartDispatch } from '@/contexts/CartContext';

export function ClearCartEffect() {
    const { clearCart } = useCartDispatch();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return null;
}
