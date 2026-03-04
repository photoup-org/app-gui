import { Button } from '@/components/ui/button';
import { Expand, Globe, Magnet, Settings, ShieldHalf, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react'

interface SolutionItem {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
}

const solutionsData: SolutionItem[] = [
    {
        id: "1",
        title: "Manutenção Preditiva",
        description: "Não espere que a máquina pare. Os nossos algoritmos detetam padrões anómalos semanas antes de uma avariara ocorrer, evitando paragens críticas na produção.",
        icon: Settings
    },
    {
        id: "2",
        title: "Escalabilidade Total",
        description: "Comece pequeno, pense grande. A nossa arquitetura modular permite monitorizar desde um único biorreator de laboratório até uma linha de produção industrial completa.",
        icon: Expand
    },
    {
        id: "3",
        title: "Precisão Industrial",
        description: "Sensores desenhados para o mundo real. Robustos o suficiente para suportar ambientes fabris agressivos (IP68), mas com a sensibilidade fina necessária para processos químicos ou biológicos delicados.",
        icon: Target
    },
    {
        id: "4",
        title: "Proteção de Lotes Críticos",
        description: "Em pequenos processos, cada lote é valioso. Seja uma cultura de microalgas ou um tanque de fermentação, receba alertas imediatos de desvios para salvar o seu produto antes que seja tarde.",
        icon: ShieldHalf
    },
    {
        id: "5",
        title: "Instalação Não-Invasiva",
        description: "Ideal para espaços apertados ou equipamentos alugados. Os nossos sensores de fixação magnética e 'clamp-on' não exigem cortes, furos ou paragens na produção para serem instalados.",
        icon: Magnet
    },
    {
        id: "6",
        title: "Gestão Remota Centralizada",
        description: "A sua operação no seu bolso. Acompanhe a pressão, vibração ou pH de múltiplos locais em tempo real, permitindo gerir a produção com confiança, mesmo quando não está nas instalações.",
        icon: Globe
    },
]
const SolutionsSections = () => {
    const router = useRouter()
    return <section className='flex justify-between w-full py-28 gap-20'>
        <div className='w-80 flex   flex-col gap-10 shrink-0'>
            <h2 className='text-5xl font-bold'>Soluções para pequenas e grandes escalas</h2>
            <Button onClick={() => router.push('/software')} size="lg" className='w-fit'>Ver Soluções</Button>
        </div>
        <div className='w-fit grid grid-cols-2 gap-10'>
            {solutionsData.map((solution) => (
                <div key={solution.id} className='flex flex-col gap-3'>
                    <div className='w-5 h-5 p-1 rounded-md bg-primary'>
                        <solution.icon className='w-7 h-7' />
                    </div>
                    <h3 className='text-lg font-bold'>{solution.title}</h3>
                    <p className='text-sm text-muted-foreground'>{solution.description}</p>
                </div>
            ))}
        </div>
    </section>
}

export default SolutionsSections