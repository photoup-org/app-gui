"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { PlanFeatureMatrix } from "@/types/pricing";

interface ParsedPlan {
    id: string;
    name: string;
    annualPrice: number;
    monthlyPrice: number;
    matrix: PlanFeatureMatrix;
}

interface ComparisonTableProps {
    plans: ParsedPlan[];
}

export function ComparisonTable({ plans }: ComparisonTableProps) {
    if (!plans || plans.length === 0) return null;

    const categoryNamesSet = new Set<string>();
    plans.forEach(plan => {
        plan.matrix?.tableCategories?.forEach(cat => categoryNamesSet.add(cat.categoryName));
    });
    const uniqueCategories = Array.from(categoryNamesSet);

    const pivotData = uniqueCategories.map(catName => {
        const featureNameSet = new Set<string>();

        plans.forEach(plan => {
            const cat = plan.matrix?.tableCategories?.find(c => c.categoryName === catName);
            if (cat) {
                cat.features.forEach(f => featureNameSet.add(f.name));
            }
        });

        const uniqueFeatures = Array.from(featureNameSet);

        const featuresPivoted = uniqueFeatures.map(fName => {
            let featureTooltip: string | undefined = undefined;

            const planValues = plans.map(plan => {
                const cat = plan.matrix?.tableCategories?.find(c => c.categoryName === catName);
                const featureObj = cat?.features.find(f => f.name === fName);

                if (featureObj && featureObj.tooltip && !featureTooltip) {
                    featureTooltip = featureObj.tooltip;
                }

                return featureObj ? featureObj.value : false;
            });

            return {
                name: fName,
                tooltip: featureTooltip,
                values: planValues
            };
        });

        return {
            categoryName: catName,
            features: featuresPivoted
        };
    });

    return (
        <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
            <div className="p-8 pb-6 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">Compare os nossos planos</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="py-6 px-8 font-semibold text-foreground w-1/3">
                                <div className="flex items-center space-x-2 text-teal-500">
                                    <span className="text-xl font-bold">€</span>
                                    <span className="font-bold text-foreground text-sm uppercase tracking-wider">Planos</span>
                                </div>
                            </th>
                            {plans.map((plan) => (
                                <th key={plan.id} className="py-6 px-6 font-semibold text-foreground text-center w-[22%]">
                                    {plan.name}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                        <tr>
                            <td className="py-5 px-8 text-sm font-medium text-muted-foreground">Custo Mensal (Faturação Anual)</td>
                            {plans.map((plan) => (
                                <td key={plan.id} className="py-5 px-6 text-sm text-center font-bold text-foreground">
                                    {plan.monthlyPrice}€
                                </td>
                            ))}
                        </tr>

                        {pivotData.map((category, catIdx) => (
                            <React.Fragment key={catIdx}>
                                <tr className="bg-muted/50 border-y border-border">
                                    <td
                                        colSpan={plans.length + 1}
                                        className="py-4 px-8 text-sm font-bold text-foreground flex items-center"
                                    >
                                        {category.categoryName}
                                    </td>
                                </tr>

                                {category.features.map((feature, fIdx) => (
                                    <tr key={fIdx} className="hover:bg-muted/50 transition-colors">
                                        <td className="py-4 px-8 text-sm text-card-foreground font-medium flex items-center">
                                            {feature.name}
                                            {feature.tooltip && <InfoTooltip text={feature.tooltip} />}
                                        </td>

                                        {feature.values.map((val, pIdx) => (
                                            <td key={pIdx} className="py-4 px-6 text-center text-sm">
                                                {typeof val === 'boolean' ? (
                                                    val ? (
                                                        <div className="flex justify-center"><Check className="h-5 w-5 text-teal-500" strokeWidth={3} /></div>
                                                    ) : (
                                                        <div className="flex justify-center"><X className="h-5 w-5 text-red-500" strokeWidth={3} /></div>
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground font-medium">{val}</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
