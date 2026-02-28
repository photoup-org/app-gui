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
