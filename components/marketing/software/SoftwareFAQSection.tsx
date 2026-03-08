import React from 'react'
import FAQSection, { FAQItem } from '../FAQSection';


const faqData: FAQItem[] = [
    {
        id: 'item-1',
        question: '1. Como funciona o assistente "Text-to-Data"? Posso fazer perguntas normais sobre a minha fábrica?',
        answer:
            'Sim. O nosso Interrogador de Dados permite-lhe colocar questões em português natural e direto. Em vez de configurar filtros complexos em dashboards, pode simplesmente perguntar "Qual foi o pico de pressão na linha 2 durante a noite?". A IA extrai as respostas exatas baseadas exclusivamente na telemetria real dos seus sensores.',
    },
    {
        id: 'item-2',
        question: '2. A IA consegue ler os manuais das minhas máquinas?',
        answer:
            'Sim, através da funcionalidade de "Análise de Manuais". A plataforma permite-lhe carregar os PDFs com as especificações técnicas e manuais dos seus equipamentos. A nossa IA cruza os dados dos sensores em tempo real com esses documentos para verificar continuamente se a sua operação está a cumprir as normas e limites estabelecidos pelo fabricante.',
    },
    {
        id: 'item-3',
        question: '3. O que acontece quando ocorre um alarme crítico? A IA ajuda a resolver?',
        answer:
            'Quando ocorre uma anomalia, o nosso "Investigador de Causa" entra em ação. O Agente não se limita a notificar a falha; ele analisa a cronologia de eventos através de todos os sensores da sua rede para identificar o evento exato que desencadeou o problema. Esta funcionalidade reduz drasticamente o tempo que a sua equipa passa a fazer diagnósticos.',
    },
    {
        id: 'item-4',
        question: '4. As respostas da IA são fiáveis? Existe o risco de a IA inventar dados?',
        answer:
            'Não. O nosso Assistente de Engenharia Digital atua com base numa arquitetura fechada e restrita. As respostas e os diagnósticos são gerados exclusivamente através do cruzamento matemático dos dados reais recolhidos pelos seus sensores e dos manuais que carregou. A IA não faz suposições externas, garantindo a precisão e a fiabilidade de nível industrial exigidas pela sua operação.',
    },
    {
        id: 'item-5',
        question: '5. Estas funcionalidades de Inteligência Artificial estão incluídas em todos os planos?',
        answer:
            'As capacidades de IA variam de acordo com as necessidades de escala. A Deteção de Anomalias padrão e o Diagnóstico de Causa Raiz básico começam a estar disponíveis no plano Industrial Pro. As funcionalidades de IA Generativa mais avançadas — incluindo o Interrogador de Dados por Chat, a Análise de Manuais (RAG) e a Deteção de Anomalias totalmente personalizada — são exclusivas do plano Executivo.',
    },
];

const SoftwareFAQSection = () => {
    return (
        <FAQSection faqData={faqData} />
    )
}


export default SoftwareFAQSection