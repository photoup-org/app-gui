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
