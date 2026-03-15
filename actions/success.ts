"use server";

import { stripe } from "@/lib/stripe";
import { z } from "zod";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

// 1. Added redirect_status to the schema
const searchParamsSchema = z.object({
  payment_intent: z.union([z.string(), z.array(z.string())]).optional(),
  setup_intent: z.union([z.string(), z.array(z.string())]).optional(),
  redirect_status: z.union([z.string(), z.array(z.string())]).optional(),
}).transform(val => ({
  payment_intent: Array.isArray(val.payment_intent) ? val.payment_intent[0] : val.payment_intent,
  setup_intent: Array.isArray(val.setup_intent) ? val.setup_intent[0] : val.setup_intent,
  redirect_status: Array.isArray(val.redirect_status) ? val.redirect_status[0] : val.redirect_status,
})).refine(data => data.payment_intent || data.setup_intent, {
  message: "Either payment_intent or setup_intent must be provided",
});

export type OrderSuccessDetails = {
  success: true;
  data: {
    intentId: string;
    metadata: Record<string, any>;
    documentUrl: string | null;
    userEmail: string | null;
    customerName: string | null;
  }
} | {
  error: string;
};

// Helper function to safely parse individual JSON fields
const safeParseJSON = (data: string | undefined, fallback: any) => {
  if (!data) return fallback;
  try { return JSON.parse(data); }
  catch { return fallback; }
};

export async function getOrderSuccessDetails(searchParams: { [key: string]: string | string[] | undefined }): Promise<OrderSuccessDetails> {
  const resolvedSearchParams = await searchParams;
  const result = searchParamsSchema.safeParse(resolvedSearchParams);
  if (!result.success) {
    return { error: "Parâmetros de URL inválidos." };
  }

  const { payment_intent, setup_intent, redirect_status } = result.data;
  const intentId = payment_intent || setup_intent;

  if (!intentId) {
    return { error: "ID da encomenda não encontrado." };
  }

  // 2. Block failed payments from seeing the success page
  if (redirect_status && !['succeeded', 'processing'].includes(redirect_status)) {
    return { error: "O pagamento não foi concluído com sucesso. Por favor, tente novamente." };
  }

  try {
    let metadata: Record<string, any> = {};
    let documentUrl: string | null = null;
    let userEmail: string | null = null;
    let customerName: string | null = null;

    if (payment_intent) {
      const intent = await stripe.paymentIntents.retrieve(payment_intent, {
        expand: ['latest_charge', 'invoice'],
      });

      const rawMetadata = intent.metadata || {};

      // 3. Safely parse metadata individually
      metadata = {
        ...rawMetadata,
        cartItems: safeParseJSON(rawMetadata.cartItems, []),
        shippingAddress: safeParseJSON(rawMetadata.shippingAddress, null),
        billingAddress: safeParseJSON(rawMetadata.billingAddress, null),
      };

      // @ts-ignore
      const invoice = intent.invoice as Stripe.Invoice | null | undefined;
      const latest_charge = intent.latest_charge as Stripe.Charge | null | undefined;

      if (invoice && typeof invoice === 'object') {
        documentUrl = invoice.hosted_invoice_url || invoice.invoice_pdf || null;
      }

      if (!documentUrl && latest_charge && typeof latest_charge === 'object') {
        documentUrl = latest_charge.receipt_url || null;
      }

      userEmail = latest_charge?.billing_details?.email || metadata.userEmail || null;
      customerName = metadata.customerName || latest_charge?.billing_details?.name || null;

    } else if (setup_intent) {
      const intent = await stripe.setupIntents.retrieve(setup_intent);
      const rawMetadata = intent.metadata || {};

      metadata = {
        ...rawMetadata,
        cartItems: safeParseJSON(rawMetadata.cartItems, []),
        shippingAddress: safeParseJSON(rawMetadata.shippingAddress, null),
        billingAddress: safeParseJSON(rawMetadata.billingAddress, null),
      };

      userEmail = metadata.userEmail || null;
      customerName = metadata.customerName || null;
    }

    return {
      success: true,
      data: {
        intentId,
        metadata,
        documentUrl,
        userEmail,
        customerName
      }
    };

  } catch (error) {
    console.error("Error fetching Stripe intent:", error);
    return { error: "Encomenda não encontrada no sistema." };
  }
}

export async function getSuccessServerData(intentId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { stripeIntentId: intentId }
    });

    if (!order) {
      return { success: false, error: "Encomenda não encontrada" };
    }

    let documentUrl: string | null = null;

    if (intentId.startsWith("pi_")) {
      const intent = await stripe.paymentIntents.retrieve(intentId, {
        expand: ['latest_charge', 'invoice']
      });

      // @ts-ignore
      const invoice = intent.invoice as Stripe.Invoice | null | undefined;
      const latest_charge = intent.latest_charge as Stripe.Charge | null | undefined;

      if (invoice && typeof invoice === 'object') {
        documentUrl = invoice.hosted_invoice_url || invoice.invoice_pdf || null;
      }

      if (!documentUrl && latest_charge && typeof latest_charge === 'object') {
        documentUrl = latest_charge.receipt_url || null;
      }
    }

    return { 
      success: true, 
      orderId: order.id, 
      documentUrl 
    };

  } catch (error) {
    console.error("Error in getSuccessServerData:", error);
    return { success: false, error: "Ocorreu um erro ao procurar a encomenda." };
  }
}