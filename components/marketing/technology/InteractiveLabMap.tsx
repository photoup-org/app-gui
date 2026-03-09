'use client'

import React from 'react'
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import techImage from '@/components/resources/images/technology/tech.png'
import { WifiOff, Wifi, Cable, Eye } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { HotspotData } from '@/types/ui'

const HOTSPOTS: (HotspotData & { color: 'destructive' | 'primary'; titleColor: string })[] = [
    {
        id: 'sensor-offline',
        x: 5,
        y: 45,
        color: 'destructive',
        title: 'Sensor Offline',
        description: 'Sem problema. Os seus dados são guardados localmente e sincronizados uma vez que o sensor volte a estar online',
        icon: WifiOff,
        titleColor: "text-destructive"
    },
    {
        id: 'data-processing',
        x: 31,
        y: 31,
        color: 'primary',
        title: 'Edge Node Local',
        description: 'Autonomia total por sala com armazenamento offline e sincronização cloud automática para garantir zero perdas de dados.',
        icon: Wifi,
        titleColor: "text-indigo-500"
    },
    {
        id: 'monitor-station',
        x: 65,
        y: 32,
        color: 'primary',
        title: 'Vista KIOSKE',
        description: 'Transforme qualquer monitor ou tablet numa central de controlo de alta visibilidade.',
        icon: Eye,
        titleColor: "text-pink-500"
    },
    {
        id: 'instrument-calibration',
        x: 55,
        y: 70,
        color: 'primary',
        title: 'Instalação Plug & Play',
        description: 'Sensores não invasivos que se instalam em minutos sem interromper os processos laboratoriais.',
        icon: Cable,
        titleColor: "text-blue-500"
    },
]

export default function InteractiveLabMap() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="relative inline-block w-full rounded-2xl overflow-hidden border bg-muted/20">
                <ImageWithSkeleton
                    src={techImage}
                    alt="Laboratory Map"
                    className="w-full h-auto object-cover"
                    priority
                />

                <TooltipProvider delayDuration={100}>
                    {HOTSPOTS.map((spot) => (
                        <Tooltip key={spot.id}>
                            <TooltipTrigger asChild>
                                <div
                                    className="absolute cursor-pointer flex items-center justify-center group"
                                    style={{
                                        left: `${spot.x}%`,
                                        top: `${spot.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                    aria-label={spot.title}
                                >
                                    <div className="relative flex h-5 w-5 md:h-8 md:w-8 items-center justify-center">
                                        <span
                                            className={cn(
                                                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                                spot.color === 'destructive' ? "bg-red-500" : "bg-teal-500"
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                "relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-white shadow-sm ring-2 ring-transparent transition-all group-hover:scale-125 group-active:scale-95",
                                                spot.color === 'destructive' ? "bg-red-500" : "bg-teal-500"
                                            )}
                                        />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent
                                sideOffset={10}
                                className="w-72 p-4 bg-white/60 backdrop-blur-md border border-neutral-200 shadow-xl rounded-xl z-50 text-left"
                            >
                                <div className="flex items-start gap-4">
                                    {spot.icon && React.createElement(spot.icon as React.ElementType, { className: cn("w-5 h-5 shrink-0", spot.titleColor) })}
                                    <div className="space-y-1.5">
                                        <h4 className={cn("font-semibold leading-none tracking-tight", spot.titleColor)}>
                                            {spot.title}
                                        </h4>
                                        <p className="text-sm text-foreground leading-snug">
                                            {spot.description}
                                        </p>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>
        </section>
    )
}
