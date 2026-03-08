import React from 'react'
import FAQSection, { FAQItem } from '../FAQSection';

const faqData: FAQItem[] = [
    {
        id: 'item-1',
        question: '1. Como garantem a segurança dos dados capturados?',
        answer:
            'A segurança é a nossa prioridade. O nosso Gateway está equipado com firewalls avançadas e suporta a criação de túneis VPN encriptados de ponta a ponta. Toda a telemetria é transmitida e armazenada de forma segura, garantindo que a rede interna da sua fábrica ou laboratório nunca fica exposta a ameaças externas.',
    },
    {
        id: 'item-2',
        question: '2. A instalação exige parar a linha de produção?',
        answer:
            'Na grande maioria dos casos, não. A nossa arquitetura foi desenhada para ser não-intrusiva. Equipamentos como a garra amperimétrica ou os sensores de vibração podem ser acoplados diretamente ao exterior das suas máquinas, permitindo uma instalação rápida sem interromper o funcionamento normal da sua operação.',
    },
    {
        id: 'item-3',
        question: '3. Posso integrar estes dados noutras plataformas (API)?',
        answer:
            'Absolutamente. Acreditamos que os dados são seus. A plataforma PhotoUP está preparada para comunicar com os sistemas que já utiliza. Através da nossa API REST e webhooks seguros, pode exportar a telemetria em tempo real para o seu ERP, sistema SCADA, ou painéis de controlo de terceiros, como o PowerBI.',
    },
    {
        id: 'item-4',
        question: '4. O hardware resiste a ambientes industriais agressivos?',
        answer:
            'Sim. O nosso Gateway principal é construído com um chassi de alumínio industrial, desenhado para dissipar calor e resistir a ambientes exigentes. Para o chão de fábrica, dispomos de sensores com alto índice de proteção (IP67/IP68), capazes de operar sob humidade extrema, poeiras e variações térmicas severas.',
    },
    {
        id: 'item-5',
        question: '5. Como é feita a alimentação dos sensores?',
        answer:
            'A nossa tecnologia adapta-se à sua infraestrutura. Dispomos de sensores de baixíssimo consumo, com baterias de longa duração (capazes de operar durante anos) para locais onde não há tomadas elétricas, e também sensores com alimentação contínua para cenários que exigem a recolha de dados de altíssima frequência ao milissegundo.',
    },
];
const TechFAQSection = () => {
    return (
        <FAQSection faqData={faqData} />
    )
}

export default TechFAQSection