"use client"

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const CTA = () => {
    const router = useRouter()

    return (<section className=' flex flex-col items-center justify-center gap-4 max-w-xl text-center min-h-[50vh]'>
        <h2 className='text-4xl font-bold'>Veja a sua Operação Através de uma <span className='text-primary'>Nova Lente</span></h2>
        <p className='text-md font-bold text-muted-foreground mb-8'>Pare de analisar gráficos e comece a receber respostas. Instale a <span className='text-primary'>PhotoUP</span> e modernize o seu processo.</p>
        <Button onClick={() => router.push("/pricing")}>Começar Agora</Button>
    </section>)
}

export default CTA