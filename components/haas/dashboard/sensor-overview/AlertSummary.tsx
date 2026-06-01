"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle, TriangleAlert, Info, Maximize, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

import { useMqttStore } from "@/hooks/useMqttStore"
import { SystemLogWithUser } from "@/app/(HaaS)/logs/actions"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AlertSummaryProps {
    initialAlerts: {
        alerts: SystemLogWithUser[];
        total: number;
    }
}

const AlertSummary = ({ initialAlerts }: AlertSummaryProps) => {
    const liveAlerts = useMqttStore((state) => state.liveAlerts);
    
    // Combine live and initial
    const allAlerts = [...liveAlerts, ...initialAlerts.alerts].slice(0, 50);

    const formatLogDate = (dateVal: Date | string) => {
        const d = new Date(dateVal);
        const pad = (n: number) => n.toString().padStart(2, "0");
        const day = pad(d.getDate());
        const month = pad(d.getMonth() + 1);
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        return `${day}/${month} - ${hours}:${minutes}`;
    };

    // Calculate counters dynamically
    const critical = allAlerts.filter(a => a.level === 'CRITICAL').length;
    const warning = allAlerts.filter(a => a.level === 'ERROR' || a.level === 'WARN').length;
    const info = allAlerts.filter(a => a.level === 'INFO').length;
    const total = allAlerts.length;
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
                        <span>{critical} Críticos</span>
                    </div>
                    <span className="text-slate-200 dark:text-slate-800 font-normal">|</span>
                    <div className="flex items-center gap-1">
                        <TriangleAlert className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                        <span>{warning} Aviso{warning !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-slate-200 dark:text-slate-800 font-normal">|</span>
                    <div className="flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                        <span>{info} Info</span>
                    </div>
                </div>

                {/* Conditional State Area */}
                <div className={cn(
                    "rounded-xl flex-1 flex flex-col border overflow-hidden min-h-[140px]",
                    total === 0
                        ? "p-5 items-center justify-center bg-emerald-50/50 border-emerald-100/50 text-emerald-600 dark:bg-emerald-950/10 dark:border-emerald-900/20 dark:text-emerald-400"
                        : "bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                )}>
                    {total === 0 ? (
                        <span className="font-bold text-xs text-center">
                            Nenhum alerta a reportar
                        </span>
                    ) : (
                        <ScrollArea className="h-full w-full">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {allAlerts.map((alert, index) => (
                                    <div key={alert.id || index} className="p-3 flex items-start gap-3 hover:bg-white dark:hover:bg-slate-800/40 transition-colors">
                                        <div className="shrink-0 mt-0.5">
                                            {alert.level === 'CRITICAL' ? (
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                            ) : alert.level === 'ERROR' || alert.level === 'WARN' ? (
                                                <TriangleAlert className="w-4 h-4 text-amber-500" />
                                            ) : (
                                                <Info className="w-4 h-4 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                                {alert.message}
                                            </span>
                                            <span className="text-[10px] text-slate-400 mt-0.5">
                                                {formatLogDate(alert.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default AlertSummary