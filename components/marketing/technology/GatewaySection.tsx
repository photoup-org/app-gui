import React from 'react';
import Image from 'next/image';
import GatewayImg from '../../resources/images/technology/gateway.webp';
import SectionTitleComponent from '../SectionTitleComponent';

export interface GatewayFeature {
    id: string;
    title: string;
    description: string;
    position: 'left' | 'right';
}

const featuresData: GatewayFeature[] = [
    { id: '1', position: 'left', title: 'Chassi em Alumínio Industrial', description: 'Desenhado para dissipar calor e resistir a ambientes exigentes, garantindo uma vida útil longa tanto em laboratórios climatizados como em chão de fábrica.' },
    { id: '2', position: 'left', title: 'Conetividade 4G/LTE Independente', description: 'Graças ao suporte para cartão SIM, o sistema pode operar de forma totalmente autónoma da rede Wi-Fi do edifício, evitando conflitos de IT e garantindo conetividade em zonas remotas.' },
    { id: '3', position: 'left', title: 'Interface RS232', description: 'Permite a integração direta com balanças de precisão, PLCs ou máquinas industriais mais antigas que ainda utilizam portas série, trazendo equipamento clássico para a era da IA' },
    { id: '4', position: 'right', title: 'Segurança de Nível Empresarial', description: 'Equipado com firewall avançada e suporte para VPNs encriptadas, assegurando que a telemetria da sua operação nunca é exposta a ameaças externas.' },
    { id: '5', position: 'right', title: 'Baixo Consumo e Alta Eficiência', description: 'Uma solução sustentável que consome o mínimo de energia enquanto processa fluxos de dados complexos em tempo real.' },
];

const FeatureNode = ({ feature, index, total }: { feature: GatewayFeature; index: number; total: number }) => {
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
        <div className={`flex flex-col ${isLeft ? 'lg:items-end lg:text-right' : 'lg:items-start lg:text-left'} items-start text-left`}>
            <div className="relative w-full">
                {/* Title container with bottom border */}
                <h3 className={`text-xl font-bold text-gray-900 pb-2 border-b border-[#2DD4BF] relative inline-block w-full
          before:content-[''] before:absolute before:bottom-[-3px] before:w-1.5 before:h-1.5 before:bg-[#2DD4BF] before:rounded-full before:hidden before:lg:block
          ${isLeft ? 'before:-right-0.5' : 'before:-left-0.5'}
          after:content-[''] after:absolute after:bottom-0 after:w-16 after:h-px after:bg-[#2DD4BF] after:hidden after:lg:block
          ${isLeft ? `after:-right-16 after:origin-left ${angleClass}` : `after:-left-16 after:origin-right ${angleClass}`}
        `}>
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
                    <Image
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
                    <Image
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