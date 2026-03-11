import React from 'react';
import TitleSection from '@/components/marketing/TitleSection';
import IncludedFeaturesSummary from './IncludedFeaturesSummary';

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
        <div className="px-6 flex flex-col gap-6 items-center mb-20">
            <TitleSection>
                <h1 className="text-3xl md:text-7xl font-bold text-foreground mb-2">Configure o seu Plano</h1>
                <p className="text-muted-foreground max-w-xl text-lg text-center mt-5">
                    O plano <span className="text-foreground font-medium ">{planName}</span> inclui <span className="text-primary font-semibold">{includedSensors} sensores-base incluídos</span> na sua mensalidade. Selecione os sensores que melhor se adaptam a si.
                </p>
            </TitleSection>
            <IncludedFeaturesSummary totalBaseSelected={totalBaseSelected} includedSensors={includedSensors} maxSensors={maxSensors} />
        </div>
    );
};
