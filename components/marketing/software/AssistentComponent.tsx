import React from 'react'
import SectionTitleComponent from '../SectionTitleComponent'
import { BookOpenCheck, HatGlasses, LucideIcon, Speech } from 'lucide-react'
import { ClassNameValue } from 'tailwind-merge'
import { cn } from '@/lib/utils'


interface TAssistentFeatures {
    icon: LucideIcon,
    title: string,
    description: string
}

interface TAssistentFeaturesComponentProps extends TAssistentFeatures {
    className?: ClassNameValue
}



const assistentFeatures: TAssistentFeatures[] = [
    {
        icon: Speech,
        title: "Text-to-Data",
        description: "Pergunte em português e receba respostas exatas baseadas nos dados reais, sem precisar de filtros."
    },
    {
        icon: BookOpenCheck,
        title: "Análise de Manuais",
        description: "A IA consulta os PDFs dos seus equipamentos para verificar se a operação cumpre as normas do fabricante."
    },
    {
        icon: HatGlasses,
        title: "Investigador de Causa",
        description: "Quando ocorre um alarme, o Agente analisa a cronologia de todos os sensores para identificar o evento que causou a falha."
    }
]


const AssistentFeaturesComponent = ({ icon: Icon, title, description, className }: TAssistentFeaturesComponentProps) => {
    return (
        <div className={cn("w-full md:w-64 h-w-64 py-7 px-6 bg-[#D4F3F3] rounded-3xl flex flex-col gap-4", className)}>
            <Icon className="w-8 h-8 text-slate-900" />
            <h3 className="font-bold text-lg leading-tight text-primary">{title}</h3>
            <p className="text-sm text-gray-600 leading-tight">{description}</p>
        </div>
    )
}

const AssistentComponent = () => {
    return (
        <section className="w-full py-16 px-4 md:px-8 overflow-hidden items-center justify-center flex flex-col">
            <SectionTitleComponent
                title=" O Seu Novo Assistente de Engenharia Digital."
                subtitle="Não se limite a olhar para gráficos. O nosso Agente de IA cruza os dados dos sensores com os seus manuais técnicos para dar respostas auditáveis."
            />
            <div className='w-full flex justify-center gap-10 items-center mt-16'>
                {assistentFeatures.map(a => {
                    return <AssistentFeaturesComponent
                        key={a.title}
                        title={a.title}
                        icon={a.icon}
                        description={a.description}
                    />
                })}

            </div>
        </section>
    )
}

export default AssistentComponent