import React from 'react';
import { Button } from '@/components/ui/button';

interface StickyCheckoutBarProps {
    totalPrice: number; // in cents
    isContinueDisabled: boolean;
    onContinue: () => void;
}

export const StickyCheckoutBar: React.FC<StickyCheckoutBarProps> = ({
    totalPrice,
    isContinueDisabled,
    onContinue
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border p-4 md:p-6 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm font-medium">Total Estimado</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-foreground text-3xl md:text-4xl font-bold">{totalPrice / 100} €</span>
                        <span className="text-muted-foreground text-sm">/mês</span>
                    </div>
                </div>

                <Button
                    onClick={onContinue}
                    disabled={isContinueDisabled}
                >
                    Rever & Continuar
                </Button>
            </div>
        </div>
    );
};
