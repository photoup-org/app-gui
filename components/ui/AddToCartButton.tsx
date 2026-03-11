"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { SerializedHardwareProduct } from "@/lib/api/products";

interface AddToCartButtonProps extends React.ComponentProps<typeof Button> {
    product: SerializedHardwareProduct;
    /** Optional callback to fire after adding to cart (e.g. closing a dialog/modal) */
    onAddComplete?: () => void;
}

export function AddToCartButton({
    product,
    onAddComplete,
    className,
    children,
    ...props
}: AddToCartButtonProps) {
    const { addItem } = useCart();
    const router = useRouter();

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent event bubbling if placed inside clickable cards
        e.stopPropagation();

        addItem(product as any, 1);
        if (onAddComplete) onAddComplete();
        router.push('/pricing?added=sensor');
    };

    return (
        <Button
            onClick={handleAddToCart}
            className={className}
            {...props}
        >
            {children || "Escolher Plano"}
        </Button>
    );
}

export default AddToCartButton;
