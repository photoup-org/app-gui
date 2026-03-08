import TitleSection from '../TitleSection'
import { BotMessageSquare, ClipboardMinus, Database, ScanSearch } from 'lucide-react'

const IconShape = [
    {
        color: "#4285F4",
        icon: ScanSearch
    },
    {
        color: "#22CB58",
        icon: Database
    },
    {
        color: "#EA4335",
        icon: ClipboardMinus
    },
    {
        color: "#6155F5",
        icon: BotMessageSquare
    }
]


const IconShapesComponent = () => {
    return (
        <div className="flex justify-center items-center gap-6 mb-15 mt-4">
            {IconShape.map((item, index) => {
                const isEven = index % 2 === 0;
                const rotationClass = isEven ? '-rotate-[15deg]' : 'rotate-[15deg]';

                return (
                    <div
                        key={index}
                        className={`flex items-center justify-center w-15 h-15 rounded-xl  ${rotationClass}`}
                        style={{
                            backgroundColor: `${item.color}33`,
                            color: item.color
                        }}
                    >
                        <item.icon className="w-5 h-5 md:w-7 md:h-7" strokeWidth={2.5} />
                    </div>
                );
            })}
        </div>
    );
}





const TitleComponent = () => {
    return <TitleSection>
        <IconShapesComponent />
        <h1 className="text-6xl font-bold mb-4 text-slate-900">Visão Global. <span className='text-primary'>Controlo Total.</span></h1>
        <h5 className='text-2xl mb-4 text-muted-foreground'>Centralize laboratórios, armazéns e linhas de produção num único ecrã.</h5>
    </TitleSection>
}

export default TitleComponent