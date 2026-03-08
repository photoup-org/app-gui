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
