export interface CheckoutFormData {
    organizationName: string;
    departmentName: string;
    nif: string;
    internalReference?: string;
    adminFullName: string;
    adminEmail: string;
    jobTitle: string;
    phone: string;
    billingAddress: {
        streetAddress: string;
        postalCode: string;
        city: string;
        country: string;
    };
    shippingAddress?: {
        streetAddress: string;
        postalCode: string;
        city: string;
        country: string;
    };
}

export type CheckoutFormValues = {
    organizationName: string;
    nif: string;
    country: string;
    departmentName: string;
    adminFullName: string;
    adminEmail: string;
    jobTitle: string;
    phone: string;
    internalReference: string;
    billingAddress: { streetAddress: string; city: string; postalCode: string; country: string };
    shippingAddress: { streetAddress: string; city: string; postalCode: string; country: string };
    hasDifferentShippingAddress: boolean;
};

export interface CartItem {
    productId: string;
    quantity: number;
    name?: string;
    price?: number;
    stripePriceId?: string;
    product?: {
        id: string;
        name: string;
        price: number;
        [key: string]: any;
    };
}

export interface PendingCart {
    id: string;
    items: CartItem[];
    createdAt: Date;
}

