"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle, TriangleAlert, Info, Maximize, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertSummaryProps {
    data: {
        critical: number;
        warning: number;
        info: number;
        total: number;
    }
}

const AlertSummary = ({ data }: AlertSummaryProps) => {
    return (
        <Card className="flex flex-col h-full shrink-0 w-80 border border-slate-100 dark:border-slate-800">
            <CardHeader className="flex flex-row items-start justify-between pb-3 px-6 space-y-0">
                <div className="flex flex-col">
                    <CardTitle className="font-bold text-slate-900 dark:text-white">
                        Alertas
                    </CardTitle>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                        Últimos 15 dias
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-bold border border-slate-100 dark:border-slate-800 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                        <span>15 dias</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    <button className="p-2 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-400 dark:text-slate-500 transition-colors" aria-label="Expandir">
                        <Maximize className="w-3.5 h-3.5" />
                    </button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pb-5 pt-0 px-6 min-h-0 gap-4">
                {/* Counters Row with Vertical Dividers */}
                <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 py-1.5 border-b border-slate-100 dark:border-slate-800 w-full shrink-0">
                    <div className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 fill-red-500/10" />
                        <span>{data.critical} Críticos</span>
                    </div>
                    <span className="text-slate-200 dark:text-slate-800 font-normal">|</span>
                    <div className="flex items-center gap-1">
                        <TriangleAlert className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                        <span>{data.warning} Aviso{data.warning !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-slate-200 dark:text-slate-800 font-normal">|</span>
                    <div className="flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                        <span>{data.info} Info</span>
                    </div>
                </div>

                {/* Conditional State Area */}
                <div className={cn(
                    "rounded-xl p-5 flex-1 flex items-center justify-center border text-center min-h-[140px]",
                    data.total === 0
                        ? "bg-emerald-50/50 border-emerald-100/50 text-emerald-600 dark:bg-emerald-950/10 dark:border-emerald-900/20 dark:text-emerald-400"
                        : "bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                )}>
                    {data.total === 0 ? (
                        <span className="font-bold text-xs">
                            Nenhum alerta a reportar
                        </span>
                    ) : (
                        <div className="flex flex-col items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                                {data.total} alerta{data.total !== 1 ? "s" : ""} ativo{data.total !== 1 ? "s" : ""}
                            </span>
                            <span className="text-[10px] text-slate-400">
                                Verifique a lista detalhada de eventos.
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default AlertSummary