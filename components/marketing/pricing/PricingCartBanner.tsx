"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, X } from 'lucide-react';

export function PricingCartBanner() {
    const { state } = useCart();
    const [isMounted, setIsMounted] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    // Only render after mount to prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const sensorCount = useMemo(() => {
        return state.items.reduce((sum, item) => {
            const isSensor = item.product.type === 'SENSOR_BASE' || item.product.type === 'SENSOR_PREMIUM';
            return isSensor ? sum + item.quantity : sum;
        }, 0);
    }, [state.items]);

    // Don't render if not mounted, no sensors, or explicitly dismissed
    if (!isMounted || sensorCount === 0 || isDismissed) return null;

    return (
        <div className=" backdrop-blur-lg sticky top-16 z-40 w-full animate-in slide-in-from-top-2 fade-in duration-300 bg-[#2DD4BF33] text-teal-950 border-y border-teal-300/50 shadow-sm py-2 px-4 flex justify-center items-center">
            <div className="flex items-center gap-3 text-sm font-bold text-primary">
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span className='text-xs'>
                    {sensorCount === 1
                        ? "1 Sensor no Carrinho."
                        : `${sensorCount} Sensores no Carrinho.`}
                    {" "}Escolha um plano abaixo para completar a sua instalação.
                </span>
            </div>
            <button
                onClick={() => setIsDismissed(true)}
                className="absolute right-4 p-1 rounded-full text-teal-800 hover:bg-teal-200/50 hover:text-teal-950 transition-colors focus:outline-none"
                aria-label="Dismiss banner"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default PricingCartBanner;
