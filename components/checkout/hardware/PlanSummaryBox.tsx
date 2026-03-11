import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface PlanSummaryBoxProps {
    planName: string;
    includedSensors: number;
    totalBaseSelected: number;
    maxSensors: number;
}

export const PlanSummaryBox: React.FC<PlanSummaryBoxProps> = ({
    planName,
    includedSensors,
    totalBaseSelected,
    maxSensors
}) => {
    return (
        <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">Configure o seu Plano</h1>
                <p className="text-muted-foreground max-w-xl text-lg">
                    O plano <span className="text-foreground font-medium">{planName}</span> inclui <span className="text-primary font-semibold">{includedSensors} sensores-base incluídos</span> na sua mensalidade. Selecione os sensores que melhor se adaptam a si.
                </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
                <div className="bg-card border border-border p-5 rounded-3xl flex items-center gap-4 shadow-lg">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <ShoppingCart size={28} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Sensores-Base Atribuídos</p>
                        <p className="text-3xl text-foreground font-bold leading-none">
                            <span className={totalBaseSelected > includedSensors ? "text-destructive" : ""}>{totalBaseSelected}</span>
                            <span className="text-muted-foreground text-xl font-medium"> / {includedSensors}</span>
                        </p>
                    </div>
                </div>
                {maxSensors < Infinity && (
                    <div className="text-sm font-medium text-destructive text-right pr-2">
                        Limite global de {maxSensors} sensores.
                    </div>
                )}
            </div>
        </div>
    );
};
