import React from 'react';
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import GatewayImg from '../../resources/images/technology/gateway.webp';
import SectionTitleComponent from '../SectionTitleComponent';
import { GatewayFeature } from '@/types/ui';
import { cn } from '@/lib/utils';

const featuresData: (Omit<GatewayFeature, 'position'> & { position: 'left' | 'right' })[] = [
    { id: '1', position: 'left', title: 'Chassi em Alumínio Industrial', description: 'Desenhado para dissipar calor e resistir a ambientes exigentes, garantindo uma vida útil longa tanto em laboratórios climatizados como em chão de fábrica.' },
    { id: '2', position: 'left', title: 'Conectividade Flexível', description: 'Garante o envio de dados via Ethernet, Modbus (RS232/RS485) ou 4G/LTE, mesmo que a rede local falhe, evitando perdas de informação crucial.' },
    { id: '3', position: 'left', title: 'Segurança Next-Gen', description: 'Inclui Firewall avançada, suporte para VPNs múltiplas, e encriptação end-to-end, protegendo os dados do sensor até à cloud IoT.' },
    { id: '4', position: 'right', title: 'Gestão Remota (RMS)', description: 'Totalmente compatível com o RMS da Teltonika, permitindo monitorização, configuração e atualizações remotas de toda a frota de gateways.' },
    { id: '5', position: 'right', title: 'Alta Disponibilidade', description: 'Design robusto com proteção contra picos de tensão e falhas temporárias de energia, mantendo os sensores SEMPRE conectados.' },
];

const FeatureNode = ({ feature, index, total }: { feature: Omit<GatewayFeature, 'position'> & { position: 'left' | 'right' }; index: number; total: number }) => {
    const isLeft = feature.position === 'left';

    // Calculate angle for the connecting line illusion
    let angleClass = '';
    if (isLeft) {
        if (index === 0) angleClass = 'after:rotate-[20deg]';
        else if (index === total - 1) angleClass = 'after:-rotate-[20deg]';
        else angleClass = 'after:rotate-0';
    } else {
        // For right-side items, line origin is right.
        // Clockwise (+deg) moves left-tip UP, Counter-clockwise (-deg) moves left-tip DOWN.
        if (index === 0) angleClass = 'after:-rotate-[20deg]'; // top item points down to center
        else if (index === total - 1) angleClass = 'after:rotate-[20deg]'; // bottom item points up to center
        else angleClass = 'after:rotate-0';
    }

    return (
        <div className={cn(
            "flex flex-col items-start text-left",
            isLeft ? "lg:items-end lg:text-right" : "lg:items-start lg:text-left"
        )}>
            <div className="relative w-full">
                {/* Title container with bottom border */}
                <h3 className={cn(
                    "text-xl font-bold text-foreground pb-2 border-b border-[#2DD4BF] relative inline-block w-full",
                    "before:content-[''] before:absolute before:bottom-[-3px] before:w-1.5 before:h-1.5 before:bg-[#2DD4BF] before:rounded-full before:hidden before:lg:block",
                    isLeft ? "before:-right-0.5" : "before:-left-0.5",
                    "after:content-[''] after:absolute after:bottom-0 after:w-16 after:h-px after:bg-[#2DD4BF] after:hidden after:lg:block",
                    isLeft ? `after:-right-16 after:origin-left ${angleClass}` : `after:-left-16 after:origin-right ${angleClass}`
                )}>
                    {feature.title}
                </h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mt-4">
                {feature.description}
            </p>
        </div>
    );
};

export const GatewayShowcase = () => {
    const leftFeatures = featuresData.filter(f => f.position === 'left');
    const rightFeatures = featuresData.filter(f => f.position === 'right');

    return (
        <section className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center gap-12">
            {/* Mobile Layout (< lg) */}
            <SectionTitleComponent
                title={<h2 className='text-4xl font-bold'>Conectividade Industrial: Fiabilidade em <span className='text-primary'>Qualquer Ambiente</span></h2>}
                subtitle='No centro da nossa rede está o Edge Gateway da Teltonika, um dispositivo de padrão industrial que garante que os seus dados chegam à plataforma, sem falhas e sem interrupções'
            />
            <div className="flex flex-col gap-12 lg:hidden">
                <div className="flex justify-center flex-col items-center">
                    <ImageWithSkeleton
                        src={GatewayImg}
                        alt="Gateway Hardware"
                        className="object-contain w-full max-w-sm h-auto drop-shadow-xl"
                    />
                </div>
                <div className="flex flex-col gap-12">
                    {featuresData.map((feature, idx) => (
                        <FeatureNode key={feature.id} feature={feature} index={idx} total={featuresData.length} /> // total here doesn't matter much for mobile as lines are hidden
                    ))}
                </div>
            </div>

            {/* Desktop Layout (lg:grid) */}
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8 items-center">
                {/* Column 1: Left Features */}
                <div className="flex flex-col gap-16">
                    {leftFeatures.map((feature, idx) => (
                        <FeatureNode key={feature.id} feature={feature} index={idx} total={leftFeatures.length} />
                    ))}
                </div>

                {/* Column 2: Center Image */}
                <div className="relative flex justify-center items-center">
                    <ImageWithSkeleton
                        src={GatewayImg}
                        alt="Gateway Hardware"
                        className="object-contain w-full h-auto drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500 relative z-10"
                        priority
                    />
                </div>

                {/* Column 3: Right Features */}
                <div className="flex flex-col gap-16">
                    {rightFeatures.map((feature, idx) => (
                        <FeatureNode key={feature.id} feature={feature} index={idx} total={rightFeatures.length} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default GatewayShowcase;