import React from 'react';
import Image from 'next/image';
import dashImg from "../../resources/images/software/dash.png";
import { LineChart, MapPin, Bell, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
    icon: LucideIcon;
    text: string;
    className?: string;
}

const FeatureCard = ({ icon: Icon, text, className }: FeatureCardProps) => {
    return (
        <div className={cn("flex items-center gap-4 p-5 bg-white/50  rounded-2xl shadow-sm border border-slate-100", className)}>
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 text-[#2DD4BF]">
                <Icon className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <p className="text-[15px] font-bold text-slate-800 leading-snug pt-1 text-left">
                {text}
            </p>
        </div>
    );
};

const DashboardDisplayComponent = () => {
    return (
        <section className="w-full  px-4 md:px-8 overflow-hidden items-center justify-center flex flex-col">
            <div className="w-full max-w-6xl mx-auto flex flex-col items-center">

                {/* Desktop View: Image with absolute floating cards */}
                <div className="relative hidden lg:block w-full max-w-4xl mt-12 mb-24">

                    {/* Main Dashboard Image */}
                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-100 bg-white w-full">
                        <Image
                            src={dashImg}
                            alt="Dashboard preview"
                            className="w-full h-auto object-cover"
                            priority
                        />
                    </div>

                    {/* Floating Card 1: Left */}
                    <FeatureCard
                        icon={LineChart}
                        text="Séries temporais em tempo real com zoom granular para análise detalhada de cada sensor"
                        className="absolute top-1/4 -left-24 xl:-left-32 z-10 w-[360px]  backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-slate-100/80"
                    />

                    {/* Floating Card 2: Top Right */}
                    <FeatureCard
                        icon={MapPin}
                        text="Visualize laboratórios ou fábricas em diferentes localizações geográficas num mapa interativo"
                        className="absolute -top-12 -right-16 xl:-right-24 z-10 w-[360px]  backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-slate-100/80"
                    />

                    {/* Floating Card 3: Bottom Right */}
                    <FeatureCard
                        icon={Bell}
                        text="Configure notificações imediatas via SMS ou Email para limites críticos de temperatura, humidade ou pressão."
                        className="absolute bottom-12 -right-20 xl:-right-28 z-10 w-[360px]  backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-slate-100/80"
                    />
                </div>

                {/* Mobile/Tablet View: Stacked layout */}
                <div className="flex lg:hidden flex-col gap-8 w-full max-w-2xl mt-8">
                    {/* Main Dashboard Image */}
                    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-white relative w-full aspect-4/3 sm:aspect-video">
                        <Image
                            src={dashImg}
                            alt="Dashboard preview"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Feature Cards Stacked */}
                    <div className="flex flex-col gap-4">
                        <FeatureCard
                            icon={LineChart}
                            text="Séries temporais em tempo real com zoom granular para análise detalhada de cada sensor"
                        />
                        <FeatureCard
                            icon={MapPin}
                            text="Visualize laboratórios ou fábricas em diferentes localizações geográficas num mapa interativo"
                        />
                        <FeatureCard
                            icon={Bell}
                            text="Configure notificações imediatas via SMS ou Email para limites críticos de temperatura, humidade ou pressão."
                        />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default DashboardDisplayComponent;