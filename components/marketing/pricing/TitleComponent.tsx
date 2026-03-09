import React from 'react'
import TitleSection from '../TitleSection'

const TitleComponent = () => {
    return (
        <TitleSection>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Escolha o <span className="text-teal-500">melhor</span> plano para <span className="text-teal-500">si!</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Planos anuais com tudo incluído. Nós fornecemos o hardware e a conectividade. Sem taxas ocultas.
            </p>
        </TitleSection>
    )
}

export default TitleComponent