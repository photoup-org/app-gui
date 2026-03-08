import React from 'react'

type TTitleSection = {
    children: React.ReactNode
}

const TitleSection = ({ children }: TTitleSection) => {
    return <section className='min-h-80 w-full flex flex-col items-center justify-center mt-16'>
        {children}
    </section>

}

export default TitleSection