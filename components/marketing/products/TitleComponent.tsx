import React from 'react'
import TitleSection from '../TitleSection'

const TitleComponent = () => {
    return (
        <TitleSection >
            <div className='max-w-4xl text-center'>
                <h1 className="text-6xl font-bold mb-4 text-slate-900">O Nosso Conjunto de <span className='text-primary'>Soluções</span></h1>
                <h5 className='text-xl mb-4 text-muted-foreground'>Encontre soluções para diferentes tipos de problemas e subscreva a um dos nossos planos.</h5>
            </div>
        </TitleSection>
    )
}

export default TitleComponent