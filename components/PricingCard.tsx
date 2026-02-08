'use client';

import React from 'react';

interface PricingCardProps {
    name: string;
    description?: string;
    price: string;
    features?: string[];
    onSelect: () => void;
    buttonText?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
    name,
    description,
    price,
    features = [],
    onSelect,
    buttonText = 'Select Plan',
}) => {
    return (
        <div className="border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900 dark:border-zinc-800 flex flex-col h-full">
            <h3 className="text-xl font-bold mb-2">{name}</h3>
            {description && <p className="text-gray-500 dark:text-gray-400 mb-4 grow">{description}</p>}
            <div className="mb-6">
                <span className="text-3xl font-bold">{price}</span>
                <span className="text-gray-500">/year</span>
            </div>

            {features.length > 0 && (
                <ul className="mb-6 space-y-2">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                        </li>
                    ))}
                </ul>
            )}

            <button
                onClick={onSelect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors mt-auto"
            >
                {buttonText}
            </button>
        </div>
    );
};
