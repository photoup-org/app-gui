export interface Product {
    id: string;
    name: string;
    description: string | null;
    prices: {
        id: string;
        unit_amount: number | null;
        currency: string;
    }[];
}

export interface StripeWebhookMetadata {
    nif?: string;
    organizationName?: string;
    departmentName?: string;
    planId?: string;
    userEmail?: string;
    userName?: string;
    pendingCartId?: string;
    billingAddress?: string; // JSON string
    shippingAddress?: string; // JSON string
    cartItems?: string; // JSON string (fallback)
}

export interface StripePaymentIntent {
    id: string;
    metadata: StripeWebhookMetadata;
    amount: number;
    currency: string;
    status: string;
    latest_charge?: any;
    invoice?: any;
}

