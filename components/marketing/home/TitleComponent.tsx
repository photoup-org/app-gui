import TitleSection from '../TitleSection'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const TitleComponent = () => {
    return <TitleSection >
        <h1 className="text-6xl font-bold mb-4 text-foreground">Torne os Seus Processos</h1>
        <h1 className="text-6xl font-bold mb-4 text-primary">Inteligentes</h1>
        <div className='flex justify-center gap-5 mt-10'>
            <Link href="/pricing" className={cn(buttonVariants({ size: "lg" }), "text-xl font-bold px-8 py-6")}>Começar Agora</Link>
            <Link href="/demo" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-xl font-bold px-8 py-6")}>Live Demo</Link>
        </div>
    </TitleSection>
}

export default TitleComponent