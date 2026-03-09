import Link from "next/link";
import { Check } from "lucide-react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { PlanFeatureMatrix } from "@/types/pricing";
import { Button } from "@/components/ui/button";

interface ParsedPlan {
    id: string;
    name: string;
    marketingDesc: string | null;
    annualPrice: number;
    monthlyPrice: number;
    isPopular: boolean;
    stripeProductId: string;
    matrix: PlanFeatureMatrix;
}

interface PricingCardsProps {
    plans: ParsedPlan[];
}

export function PricingCards({ plans }: PricingCardsProps) {
    if (!plans || plans.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((plan) => (
                <div
                    key={plan.id}
                    className={`relative rounded-3xl bg-card p-8 flex flex-col transition-transform
            ${plan.isPopular
                            ? "border-2 border-teal-500 shadow-xl md:scale-105 z-10"
                            : "border border-border shadow-sm"
                        }
          `}
                >
                    {plan.isPopular && (
                        <div className="absolute -top-4 left-0 right-0 flex justify-center">
                            <span className="bg-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                                Mais Popular
                            </span>
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className="text-2xl font-semibold text-foreground">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">
                            {plan.marketingDesc}
                        </p>
                    </div>

                    <div className="mb-8 flex flex-col items-start">
                        <div className="flex items-baseline text-card-foreground">
                            <span className="text-2xl font-bold align-top mt-1 mr-1 text-teal-500">€</span>
                            <span className="text-6xl font-extrabold tracking-tight">{plan.monthlyPrice}</span>
                            <span className="text-lg text-muted-foreground ml-1 font-medium">/mês</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 font-medium">
                            Faturado anualmente por um valor de <span className="font-bold text-foreground">{plan.annualPrice}€</span>
                        </p>
                    </div>

                    <Button
                        asChild
                        className={`w-full mb-8 font-semibold rounded-xl text-base transition-colors ${plan.isPopular
                            ? "bg-teal-500 hover:bg-teal-600 text-white py-6 shadow-md"
                            : "bg-teal-500 hover:bg-teal-600 text-white py-5 shadow-sm"
                            }`}
                    >
                        <Link href={`/checkout/hardware?product_id=${plan.stripeProductId}`}>
                            Selecionar Plano
                        </Link>
                    </Button>

                    <div className="flex-1 mt-2">
                        <h4 className="text-xs font-bold text-foreground mb-4 tracking-wider uppercase">
                            O que está incluído
                        </h4>
                        <ul className="space-y-4">
                            {plan.matrix?.cardFeatures?.map((feature, idx) => (
                                <li key={idx} className="flex">
                                    <div className="flex items-start">
                                        {feature.included ? (
                                            <Check className="h-5 w-5 text-teal-500 shrink-0 mr-3 mt-0.5" strokeWidth={3} />
                                        ) : (
                                            <span className="h-5 w-5 shrink-0 mr-3" />
                                        )}
                                        <span className="text-sm text-card-foreground font-medium leading-relaxed flex items-center">
                                            {feature.text}
                                            {feature.tooltip && (
                                                <InfoTooltip text={feature.tooltip} />
                                            )}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}
