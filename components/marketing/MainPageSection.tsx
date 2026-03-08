import React from 'react'
import { type ClassValue } from 'clsx'
import { cn } from '@/lib/utils'

const MainPageSection = ({ children, className }: { children: React.ReactNode, className?: ClassValue }) => {
    return (
        <div className={cn("w-full min-h-screen", className)}>{children}</div>

    )
}

export default MainPageSection