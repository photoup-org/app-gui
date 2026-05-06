'use server';

import { stripe } from "@/lib/stripe";
import { z } from "zod";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

// 1. Unified Zod Schema
const searchParamsSchema = z.object({
    payment_intent: z.union([z.string(), z.array(z.string())]).optional(),
    setup_intent: z.union([z.string(), z.array(z.string())]).optional(),
    redirect_status: z.union([z.string(), z.array(z.string())]).optional(),
}).transform(val => ({
    payment_intent: Array.isArray(val.payment_intent) ? val.payment_intent[0] : val.payment_intent,
    setup_intent: Array.isArray(val.setup_intent) ? val.setup_intent[0] : val.setup_intent,
    redirect_status: Array.isArray(val.redirect_status) ? val.redirect_status[0] : val.redirect_status,
})).refine(data => data.payment_intent || data.setup_intent, {
    message: "O ID do pagamento está em falta.",
});

// Helper to parse metadata strings back into objects
const safeParseJSON = (data: string | undefined, fallback: any) => {
    if (!data) return fallback;
    try { return JSON.parse(data); }
    catch { return fallback; }
};

export async function processSuccessPageData(rawSearchParams: any) {
    // 1. Validate URL Params
    const result = searchParamsSchema.safeParse(rawSearchParams);
    if (!result.success) {
        return { success: false, error: "Parâmetros de URL inválidos." };
    }

    const { payment_intent, setup_intent, redirect_status } = result.data;
    const intentId = payment_intent || setup_intent;

    if (redirect_status && !['succeeded', 'processing'].includes(redirect_status)) {
        return { success: false, error: "O pagamento não foi concluído com sucesso." };
    }

    try {
        let invoiceId: string | null = null;
        let documentUrl: string | null = null;
        let parsedMetadata: Record<string, any> = {};

        // 2. Fetch from Stripe ONCE
        if (intentId!.startsWith("pi_")) {
            const intent = await stripe.paymentIntents.retrieve(intentId!, {
                expand: ['latest_charge']
            });

            const rawIntent = intent as any;
            
            // Extract IDs and URLs
            invoiceId = rawIntent.payment_details?.order_reference || rawIntent.invoice || rawIntent.invoice?.id || null;
            const latest_charge = rawIntent.latest_charge as Stripe.Charge | null;
            
            if (latest_charge && typeof latest_charge === 'object') {
                documentUrl = latest_charge.receipt_url || null;
            }

            // Extract & Parse Metadata (For graceful fallback)
            const rawMetadata = intent.metadata || {};
            let cartItems = [];
            if (rawMetadata.pendingCartId) {
                const pendingCart = await prisma.pendingCart.findUnique({
                    where: { id: rawMetadata.pendingCartId }
                });
                if (pendingCart) cartItems = pendingCart.items as any[];
            } else {
                cartItems = safeParseJSON(rawMetadata.cartItems, []);
            }

            parsedMetadata = {
                ...rawMetadata,
                cartItems,
                shippingAddress: safeParseJSON(rawMetadata.shippingAddress, null),
                billingAddress: safeParseJSON(rawMetadata.billingAddress, null),
                userEmail: latest_charge?.billing_details?.email || rawMetadata.userEmail || null,
                customerName: rawMetadata.customerName || latest_charge?.billing_details?.name || null,
            };
        }

        // 3. Poll the Database (Wait for the Webhook)
        let order = null;
        let attempts = 0;
        
        while (!order && attempts < 5) {
            order = await prisma.order.findFirst({
                where: {
                    OR: [
                        { stripeIntentId: intentId },
                        { stripeIntentId: invoiceId || 'undefined_fallback' }
                    ]
                }
            });

            if (!order) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            }
        }

        // 4. Return unified result
        return {
            success: true,
            orderId: order?.id || "Em processamento...", // Fallback ID if webhook is slow
            documentUrl,
            metadata: parsedMetadata, // Send metadata to UI just in case DB failed
            isDbSyncComplete: !!order // Flag to let the UI know if this is a DB order or a Stripe fallback
        };

    } catch (error) {
        console.error("[Success Action Error]:", error);
        return { success: false, error: "Falha ao comunicar com o servidor de pagamentos." };
    }
}