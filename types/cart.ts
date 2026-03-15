import type { PlanTier, HardwareProduct, Address } from '@prisma/client';

export type CartItem = {
    product: HardwareProduct; // Includes id, name, price, type ('GATEWAY' | 'SENSOR_BASE' | 'SENSOR_PREMIUM')
    quantity: number;
    stripePriceId?: string;
};
export type CartAddress = Omit<Address, 'id' | 'createdAt' | 'updatedAt' | "nif" | "contactName">;

export type CartState = {
    selectedPlan: PlanTier | null;
    items: CartItem[];
    extraSensorPriceAmount: number;
    billingAddress?: CartAddress | null;
    shippingAddress?: CartAddress | null;
    userEmail?: string | null;
};

export type LineItem = {
    id: string;
    productId?: string;
    name: string;
    price: number;
    quantity: number;
    isIncluded: boolean;
};

export type CartContextType = {
    state: CartState;
    lineItems: LineItem[];
    grandTotal: number;
    setPlan: (plan: PlanTier) => void;
    setBundle: (plan: PlanTier | null, items: CartItem[]) => void;
    setExtraSensorPrice: (price: number) => void;
    addItem: (product: HardwareProduct, quantity: number, stripePriceId?: string) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
};
