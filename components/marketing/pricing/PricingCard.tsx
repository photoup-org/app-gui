'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface PricingCardProps {
    id: string;
    name: string;
    description?: string;
    price: string;
    features?: string[];
    onSelect?: (id: string) => void;
    href?: string;
    buttonText?: string;
    badge?: string;
    plan?: any;
}

export const PricingCard: React.FC<PricingCardProps> = React.memo(({
    id,
    name,
    description,
    price,
    features = [],
    onSelect,
    href,
    buttonText = 'Select Plan',
    badge,
    plan,
}) => {
    const { setPlan } = useCart();

    const handleSelect = () => {
        if (plan) {
            console.log('Adding item:', plan);
            setPlan(plan);
        }
        onSelect?.(id);
    };
    return (
        <div className={`border rounded-xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col h-full relative ${badge ? 'border-primary shadow-primary/10 bg-primary/5' : 'bg-background border-border'
            }`}>
            {badge && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {badge}
                    </span>
                </div>
            )}
            <h3 className="text-xl font-bold mb-2 pt-2">{name}</h3>
            {description && <p className="text-muted-foreground mb-4 grow">{description}</p>}
            <div className="mb-6">
                <span className="text-3xl font-bold">{price}</span>
                <span className="text-muted-foreground">/year</span>
            </div>

            {features.length > 0 && (
                <ul className="mb-6 space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-muted-foreground">
                            <svg className="w-5 h-5 mr-3 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            )}

            {href ? (
                <Link
                    href={href}
                    onClick={handleSelect}
                    className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors mt-auto block"
                >
                    {buttonText}
                </Link>
            ) : (
                <button
                    onClick={handleSelect}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors mt-auto"
                >
                    {buttonText}
                </button>
            )}
        </div>
    );
});

PricingCard.displayName = 'PricingCard';
