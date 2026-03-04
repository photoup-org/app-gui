import React from 'react';
import { PlanTier } from '@prisma/client';
import { Check, X } from 'lucide-react';

interface PricingComparisonTableProps {
    plans: PlanTier[];
}

export const PricingComparisonTable: React.FC<PricingComparisonTableProps> = ({ plans }) => {
    if (!plans || plans.length === 0) return null;

    // We assume the first plan's uiFeatureMatrix structure defines the categories for all plans.
    // Given the seed data, all plans have the exact same keys.
    const baseMatrix = plans[0].uiFeatureMatrix as Record<string, Record<string, any>>;
    const categories = Object.keys(baseMatrix || {});

    return (
        <div className="mt-16 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-6 bg-gray-50 dark:bg-zinc-950 font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-zinc-800 w-1/4">
                                Features
                            </th>
                            {plans.map((plan) => (
                                <th key={plan.id} className="p-6 bg-gray-50 dark:bg-zinc-950 font-bold text-lg text-center text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-zinc-800 w-1/4">
                                    {plan.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <React.Fragment key={category}>
                                {/* Category Header Row */}
                                <tr className="bg-gray-100 dark:bg-zinc-800/50">
                                    <td
                                        colSpan={plans.length + 1}
                                        className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider border-b border-gray-200 dark:border-zinc-800"
                                    >
                                        {category}
                                    </td>
                                </tr>

                                {/* Feature Rows */}
                                {Object.keys(baseMatrix[category]).map((featureName, index) => (
                                    <tr key={featureName} className={`border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50/50 dark:bg-zinc-900/50'}`}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {featureName}
                                        </td>

                                        {plans.map((plan) => {
                                            const planMatrix = plan.uiFeatureMatrix as Record<string, Record<string, any>>;
                                            const featureValue = planMatrix?.[category]?.[featureName];

                                            return (
                                                <td key={`${plan.id}-${featureName}`} className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        {typeof featureValue === 'boolean' ? (
                                                            featureValue ? (
                                                                <Check className="w-5 h-5 text-green-500" />
                                                            ) : (
                                                                <X className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                                            )
                                                        ) : (
                                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                                {featureValue}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
