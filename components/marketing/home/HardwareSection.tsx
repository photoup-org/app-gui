import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'


type TStepComponent = {
    step: number,
    title: string,
    description: React.ReactElement
}

const HardwareSection = () => {
    const router = useRouter()
    return (
        <section className="w-full flex flex-col items-center py-28">
            <h2 className="text-4xl font-bold mb-4">Hardware & Software em 3 passos</h2>
            <p className="text-lg text-muted-foreground mb-8">Subscreva à nossa plataforma e modernize o seu processo</p>
            <div className="w-full flex justify-center items-center">
                <div className='w-96 flex flex-col gap-10'>
                    <StepComponent step={1} title='Escolha o seu Plano' description={
                        <>
                            Selecione <span className='text-primary font-bold'> Starter </span>(3 sensores), <span className='text-primary font-bold'>Industrial Pro</span> (10 sensores), ou <span className='text-primary font-bold'>Executivo</span> (20 sensores)
                        </>
                    } />
                    <StepComponent step={2} title='Personalize os Sensores' description={
                        <span>Escolha os sensores base (incluídos) ou adicione Sensores Premium como pH, Salinidade, ou Biogás por uma taxa única</span>
                    } />
                    <StepComponent step={3} title='Receba e Instale' description={
                        <span>
                            Receba o seu Hardware: Nós enviamos o seu Gateway pré-configurado. É só ligar e começar a monitorizar o seu processo.
                        </span>
                    } />
                    <Button className='w-fit' size="lg" onClick={() => router.push('/pricing')}>
                        Começar
                    </Button>
                </div>
                <div>

                </div>
            </div>
        </section>
    )
}

const StepComponent = ({ step, title, description }: TStepComponent) => {
    return <div className="flex gap-2 text-sm">
        <div className="w-7 h-7 rounded-md border-primary border-2 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold">{step}</span>
        </div>
        <p>
            <span className='font-bold'>{title}:</span> {description}
        </p>
    </div>
}

export default HardwareSection