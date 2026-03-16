"use client";

import { useEffect, useState } from "react";
import { useCartState, useCartDispatch } from "@/contexts/CartContext";
import { Check, Download, Package, CreditCard, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface SuccessSummaryProps {
    orderId: string;
    documentUrl: string | null;
}

export default function SuccessSummary({
    orderId,
    documentUrl,
}: SuccessSummaryProps) {
    const cartState = useCartState();
    const { clearCart } = useCartDispatch();
    const [orderSnapshot, setOrderSnapshot] = useState<any>(null);

    useEffect(() => {
        if (cartState && cartState.state.items.length > 0 && !orderSnapshot) {
            setOrderSnapshot({
                cartItems: cartState.state.items,
                billingAddress: cartState.state.billingAddress,
                shippingAddress: cartState.state.shippingAddress,
                userEmail: cartState.state.userEmail,
                planId: cartState.state.selectedPlan?.id
            });
            // clearCart();
        }
    }, [cartState, orderSnapshot]);

    if (!orderSnapshot) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <p>Loading...</p>
            </div>
        );
    }

    const displayData = orderSnapshot || cartState;
    if (!displayData) return null;

    return (
        <div className="max-w-4xl mx-auto w-full space-y-10 flex-1 items-center justify-center">
            {/* Hero / Header */}
            <div className="text-center space-y-5">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-2 ring-8 ring-green-50 dark:ring-green-950/30">
                    <Check className="w-10 h-10 text-green-600 dark:text-green-500" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Pagamento Concluído com Sucesso!</h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    A sua encomenda foi recebida e está a ser processada pela nossa equipa.
                </p>
            </div>

            {/* Email Callout */}
            {displayData.userEmail && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center shadow-sm max-w-2xl mx-auto transition-colors hover:bg-primary/10">
                    <p className="text-base text-primary/90">
                        Um convite para aceder à plataforma foi enviado para <span className="font-bold text-primary">{displayData.userEmail}</span>.
                    </p>
                </div>
            )}

            {/* Order Details Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-card border rounded-xl p-6  gap-6">
                <div className="space-y-1 text-center sm:text-left">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Número da Encomenda</p>
                    <p className="text-xl font-mono font-semibold tracking-tight">{orderId}</p>
                </div>
                {documentUrl && (
                    <Button asChild variant="default" className="shrink-0 gap-2 shadow-sm">
                        <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                            Descarregar Fatura
                        </a>
                    </Button>
                )}
            </div>

            {/* 2-Column Layout */}
            <div className="gap-8 flex flex-col">

                {/* Left Column: Shipping & Billing */}
                <div className="lg:col-span-5 space-y-6">
                    {displayData.shippingAddress && (
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5 text-foreground border-b pb-4">
                                <div className="p-2 bg-muted rounded-md">
                                    <MapPin className="w-5 h-5 text-foreground" />
                                </div>
                                <h2 className="font-semibold text-lg">Detalhes de Envio</h2>
                            </div>
                            <address className="not-italic text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                                <p className="font-medium text-foreground text-base">{displayData.shippingAddress.name}</p>
                                <p>{displayData.shippingAddress.street}</p>
                                <p>{displayData.shippingAddress.zipCode} {displayData.shippingAddress.city}</p>
                                <p>{displayData.shippingAddress.country}</p>
                            </address>
                        </div>
                    )}

                    {displayData.billingAddress && (
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5 text-foreground border-b pb-4">
                                <div className="p-2 bg-muted rounded-md">
                                    <CreditCard className="w-5 h-5 text-foreground" />
                                </div>
                                <h2 className="font-semibold text-lg">Detalhes de Faturação</h2>
                            </div>
                            <address className="not-italic text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                                <p className="font-medium text-foreground text-base">{displayData.billingAddress.name}</p>
                                {displayData.nif && <p>NIF: <span className="font-mono">{displayData.nif}</span></p>}
                                <p>{displayData.billingAddress.street}</p>
                                <p>{displayData.billingAddress.zipCode} {displayData.billingAddress.city}</p>
                                <p>{displayData.billingAddress.country}</p>
                            </address>
                        </div>
                    )}
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-7 bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b bg-muted/30">
                        <div className="flex items-center gap-3 text-foreground">
                            <div className="p-2 bg-background rounded-md shadow-sm border">
                                <Package className="w-5 h-5 text-foreground" />
                            </div>
                            <h2 className="font-semibold text-lg">Resumo da Encomenda</h2>
                        </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                        {displayData.cartItems && displayData.cartItems.length > 0 ? (
                            <ul className="space-y-5">
                                {displayData.cartItems.map((item: any, i: number) => (
                                    <li key={i} className="flex gap-5 items-center">
                                        <div className="relative w-16 h-16 bg-muted/50 rounded-lg border flex items-center justify-center shrink-0">
                                            <Package className="w-8 h-8 text-muted-foreground/40" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-medium text-foreground truncate">
                                                {item.product?.name || item.name || "Produto Hardware"}
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium text-muted-foreground whitespace-nowrap bg-muted px-3 py-1 rounded-full">
                                            Qtd: {item.quantity}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground italic text-center py-8">Nenhum hardware na encomenda.</p>
                        )}

                        {displayData.planId && (
                            <div className="mt-8 pt-6 border-t bg-muted/10 -mx-6 -mb-6 p-6">
                                <div className="flex justify-between items-center">
                                    <p className="text-base font-medium text-foreground">Plano de Subscrição</p>
                                    <p className="text-sm font-semibold tracking-wide text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">
                                        {displayData.planId}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <div className="pt-10 pb-6 text-center">
                <Button asChild variant="outline" size="lg" className="px-8 shadow-sm">
                    <Link href="/">Voltar à Página Inicial</Link>
                </Button>
            </div>
        </div>
    );
}
