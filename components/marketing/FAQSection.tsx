import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

// PHASE 1: TYPES & STATIC DATA
export interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        id: 'item-1',
        question: '1. O hardware incluído no plano passa a ser meu?',
        answer:
            'Não. Adotamos um modelo de "Hardware-as-a-Service" (HaaS). Isto significa que o equipamento é fornecido em regime de aluguer enquanto a subscrição estiver ativa. A grande vantagem para si é a Garantia Vitalícia: se um gateway ou sensor avariar (por uso normal), nós substituímos gratuitamente e de imediato. Nunca terá de comprar equipamento novo por obsolescência.',
    },
    {
        id: 'item-2',
        question: '2. O que acontece se eu cancelar a subscrição?',
        answer:
            'Se cancelar a subscrição, o acesso à plataforma será interrompido e a nossa equipa agendará a recolha de todos os equipamentos instalados (gateways e sensores) que foram fornecidos no âmbito do plano HaaS. Não existem penalizações de cancelamento desde que cumprido o período inicial de fidelização (se aplicável).',
    },
    {
        id: 'item-3',
        question: '3. Posso integrar os sensores antigos que já tenho na fábrica?',
        answer:
            'Sim, a nossa gateway é compatível com múltiplos protocolos industriais standard. Uma avaliação técnica inicial pode confirmar quais dos seus sensores existentes podem ser integrados diretamente na nossa plataforma, aproveitando o seu investimento anterior.',
    },
    {
        id: 'item-4',
        question: '4. Os sensores vêm com Certificado de Calibração (ISO)?',
        answer:
            'Os sensores laboratoriais e de alta precisão (como os de temperatura e humidade para ambientes controlados) podem ser fornecidos com certificados de calibração rastreáveis. Para os equipamentos standard industriais, são calibrados de fábrica e possuem conformidade CE, sendo os certificados específicos requeridos à parte.',
    },
    {
        id: 'item-5',
        question: '5. O que acontece se a internet ou o Wi-Fi falhar na fábrica?',
        answer:
            'As nossas gateways estão equipadas com memória local (buffer) que garante a retenção dos dados recolhidos durante falhas de conectividade. Assim que a rede for restabelecida, todo o histórico é sincronizado automaticamente com a cloud, garantindo que não há perda de dados críticos.',
    },
];

// PHASE 3: COMPONENT ARCHITECTURE
const FAQSection = () => {
    return (
        <section className="w-full max-w-4xl mx-auto py-16 px-4">
            <h2 className="text-3xl font-extrabold mb-8 text-gray-900">
                Perguntas Frequentes (FAQ)
            </h2>

            {/* PHASE 2: SHADCN ACCORDION OVERRIDES */}
            <div className="flex flex-col gap-4">
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqData.map((item) => (
                        <AccordionItem
                            key={item.id}
                            value={item.id}
                            className="border border-gray-200 rounded-xl px-6 bg-white overflow-hidden border-b-0"
                        >
                            <AccordionTrigger className="font-bold text-gray-900 hover:no-underline">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 leading-relaxed pb-6">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FAQSection;
