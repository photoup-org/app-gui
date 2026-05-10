export interface CardFeature {
    text: string;
    included: boolean;
    tooltip?: string;
}

export interface TableFeature {
    name: string;
    value: string | boolean;
    tooltip?: string;
}

export interface TableCategory {
    categoryName: string;
    features: TableFeature[];
}

export interface PlanFeatureMatrix {
    cardFeatures: CardFeature[];
    tableCategories: TableCategory[];
}

export interface Plan {
    id: string;
    name: string;
    priceAmount: number;
    currency: string;
    marketingDesc: string | null;
    isPopular: boolean;
    stripeProductId: string;
    includedSensors: number;
    maxSensors: number | null;
    extraSensorPriceAmount?: number;
    matrix: PlanFeatureMatrix;
    includedGateways: number;
    extraSensorStripePriceId: string | null;
    maxUsers: number | null;
    dataRetentionMonths: number;
    orderIndex: number;
}


