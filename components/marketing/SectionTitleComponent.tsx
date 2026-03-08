import React from "react"

type TSectionTitleProps = {
    title: string | React.ReactNode,
    subtitle?: string
}

const SectionTitleComponent = ({ title, subtitle }: TSectionTitleProps) => {
    return <div className='flex flex-col items-center gap-4 max-w-3xl text-center'>
        {typeof title === "string" ? <h2 className='text-4xl font-bold'>{title}</h2> : title}
        {subtitle && <p className='text-lg text-muted-foreground mb-8'>{subtitle}</p>}
    </div>

}

export default SectionTitleComponent