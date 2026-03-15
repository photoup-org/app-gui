"use client";

import { useEffect, useRef } from "react";
import { useCartDispatch } from "@/contexts/CartContext";

export default function ClearCartOnSuccess() {
    const { clearCart } = useCartDispatch();
    const hasCleared = useRef(false);

    useEffect(() => {
        if (!hasCleared.current) {
            clearCart();
            hasCleared.current = true;
        }
    }, [clearCart]);

    return null;
}
