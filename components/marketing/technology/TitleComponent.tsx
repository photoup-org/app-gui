import React from 'react'
import TitleSection from '../TitleSection'

const TitleComponent = () => {
  return (
    <TitleSection >
      <div className='max-w-3xl text-center'>
        <h1 className="text-6xl font-bold mb-4 text-slate-900">Tecnologia <span className='text-primary'>Resiliente</span> para Ambientes de <span className='text-primary'>Precisão</span></h1>
        <h5 className='text-2xl mb-4 text-muted-foreground'>Uma infraestrutura Edge-First que garante a integridade dos seus dados, com ou sem ligação à internet.</h5>
      </div>
    </TitleSection>
  )
}

export default TitleComponent