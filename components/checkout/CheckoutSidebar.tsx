'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Check, Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function CheckoutSidebar() {
    const { state, lineItems, grandTotal, updateQuantity, removeItem, clearCart } = useCart();
    const router = useRouter();

    React.useEffect(() => {
        if (!state.selectedPlan) {
            router.push('/pricing');
        }
    }, [state.selectedPlan, router]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount / 100);
    };

    const handleClearCart = () => {
        clearCart();
        router.push('/pricing');
    };

    const handleCheckout = () => {
        if (!state.selectedPlan) return;

        const totalSensors = state.items.reduce((sum, item) => {
            const isSensor = item.product.type === 'SENSOR_BASE' || item.product.type === 'SENSOR_PREMIUM';
            return isSensor ? sum + item.quantity : sum;
        }, 0);

        const selectedHardware = state.items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            stripePriceId: item.stripePriceId,
            type: item.product.type
        }));

        const encodedHardware = encodeURIComponent(JSON.stringify(selectedHardware));
        router.push(`/checkout?plan_id=${state.selectedPlan.stripeProductId}&hardware=${encodedHardware}&totalSensors=${totalSensors}`);
    };

    return (
        <div className="sticky top-24 h-[calc(100vh-8rem)] flex flex-col pb-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Cart</h2>
                </div>
                {lineItems.length > 0 && (
                    <button
                        onClick={handleClearCart}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors shrink-0"
                    >
                        Clear Cart
                    </button>
                )}
            </div>

            {/* Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
                {lineItems.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                        Your cart is empty.
                    </div>
                ) : (
                    lineItems.map((item) => (
                        <div key={item.id} className="flex items-start justify-between text-sm group">
                            <div className="flex flex-col gap-1 pr-4">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {item.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="flex flex-col items-end gap-1">
                                    {item.isIncluded ? (
                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-500 font-medium">
                                            Included <Check className="w-3 h-3" />
                                        </span>
                                    ) : (
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(item.price)}
                                        </span>
                                    )}
                                </div>
                                {item.productId && !item.id.startsWith('plan-') && (
                                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                const cartItem = state.items.find(i => i.product.id === item.productId);
                                                if (cartItem) {
                                                    if (cartItem.quantity <= 1) {
                                                        removeItem(item.productId!);
                                                    } else {
                                                        updateQuantity(item.productId!, cartItem.quantity - 1);
                                                    }
                                                }
                                            }}
                                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 dark:border-zinc-700 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const cartItem = state.items.find(i => i.product.id === item.productId);
                                                if (cartItem) {
                                                    updateQuantity(item.productId!, cartItem.quantity + 1);
                                                }
                                            }}
                                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 dark:border-zinc-700 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.productId!)}
                                            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ml-1"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-zinc-800 mt-auto shrink-0 pb-8">
                <div className="flex items-center justify-between text-base font-bold text-gray-900 dark:text-white mb-2">
                    <span>Total due today</span>
                    <span>{formatCurrency(grandTotal)}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right mb-4">
                    Plus applicable taxes
                </p>
                <Button
                    className="w-full text-lg py-6"
                    disabled={lineItems.length === 0 || !state.selectedPlan}
                    onClick={handleCheckout}
                >
                    Continue to Checkout
                </Button>
            </div>
        </div>
    );
}
