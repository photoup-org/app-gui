import { cn } from '@/lib/utils';
import React from 'react'

interface IDashboardRowProps {
    children: React.ReactNode;
    className?: string;
}

const DashboardRow = ({ children, className }: IDashboardRowProps) => {
    return (
        <section className={cn("space-y-6 w-full h-80 flex justify-between items-center gap-5", className)}>
            {children}
        </section>
    )
}

export default DashboardRow