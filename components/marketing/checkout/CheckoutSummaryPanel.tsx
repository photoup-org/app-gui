'use client';

import React from 'react';
import { useCartState } from '@/contexts/CartContext';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

/**
 * CheckoutSummaryPanel — right-column cart summary for the /checkout page.
 *
 * Subscribes ONLY to CartStateContext via `useCartState()`.
 * It does NOT subscribe to CartDispatchContext, so mutation actions
 * (addItem, updateQuantity, etc.) triggered elsewhere will NOT cause this
 * component to re-render.
 */
export function CheckoutSummaryPanel() {
    const { state, lineItems, grandTotal, isLoading } = useCartState();

    const formatCurrency = (amountInCents: number) =>
        new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amountInCents / 100);

    // Estimate shipping: 10 € flat rate if hardware items are present
    const hasHardware = state.items.some(
        (i) => i.product.type === 'GATEWAY' || i.product.type === 'SENSOR_BASE' || i.product.type === 'SENSOR_PREMIUM',
    );
    const shippingCents = hasHardware ? 1000 : 0;

    // IVA (VAT) 23% — applied on (subtotal + delivery), excl. already-included items
    const subtotalBeforeVat = grandTotal + shippingCents;
    const vatAmount = Math.round(subtotalBeforeVat * 0.23);
    const totalWithVat = subtotalBeforeVat + vatAmount;

    if (isLoading) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 animate-pulse space-y-4">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <h2 className="text-xl font-semibold text-foreground">Resumo</h2>

            {/* Plan headline */}
            {state.selectedPlan && (
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="font-semibold text-[#2DCFBE] text-base leading-tight">
                            {state.selectedPlan.name}
                        </p>
                        <a
                            href="/pricing"
                            className="text-xs text-[#2DCFBE] underline underline-offset-2 hover:opacity-80 mt-0.5 inline-block"
                        >
                            Veja tudo o que está incluído no plano
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                            Plano válido por <strong>1 ano</strong> automaticamente renovável.
                        </p>
                    </div>
                    <span className="font-bold text-foreground text-base shrink-0">
                        {formatCurrency(state.selectedPlan.priceAmount ?? 0)}
                    </span>
                </div>
            )}

            {/* Line items */}
            {lineItems.length > 0 && (
                <div className="space-y-3">
                    {lineItems.map((item) => {
                        // Find the corresponding product from state.items to get the image URL
                        const product = state.items.find(cartItem => cartItem.product.id === item.productId)?.product;
                        const imageUrl = product?.imageUrl;

                        return (
                            <div key={item.id} className="flex items-center gap-3">
                                {/* Product image */}
                                <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="40px"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted" />
                                    )}
                                    {/* Quantity badge */}
                                    {item.quantity > 1 && (
                                        <span className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                                            {item.quantity}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                    {item.isIncluded && (
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity > 1 ? 'Dispositivos incluídos no plano' : 'Dispositivo incluído no plano'}
                                        </p>
                                    )}
                                </div>

                                <div className="text-right shrink-0">
                                    {item.isIncluded ? (
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-medium text-foreground">0 €</span>
                                            <span className="text-xs text-muted-foreground line-through">
                                                {formatCurrency(item.price)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-medium text-foreground">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Separator />

            {/* Subtotal / Entrega / IVA / Total */}
            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-foreground">
                    <span>Entrega</span>
                    <span>{shippingCents === 0 ? '—' : formatCurrency(shippingCents)}</span>
                </div>

                <Separator className="my-1" />

                <div className="flex justify-between text-foreground">
                    <span>Total s/ IVA</span>
                    <span>{formatCurrency(subtotalBeforeVat)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs">
                    <span>IVA (23%)</span>
                    <span>{formatCurrency(vatAmount)}</span>
                </div>

                <Separator className="my-1" />

                <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-foreground">Total</span>
                    <span className="text-lg font-bold text-foreground">{formatCurrency(totalWithVat)}</span>
                </div>
            </div>
        </div>
    );
}
