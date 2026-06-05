"use client";

import React, { useState } from "react";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { format } from "date-fns";
import { AlertCircle, TriangleAlert, Info, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DeviceAlert {
    id: string;
    createdAt: Date | string;
    severity: string;
    title: string;
    message: string | null;
    experiment: {
        id: string;
        name: string;
    } | null;
}

interface DeviceAlertsTableProps {
    alerts: DeviceAlert[];
}

export function DeviceAlertsTable({ alerts }: DeviceAlertsTableProps) {
    const [severityFilter, setSeverityFilter] = useState<string>("ALL");

    const filteredAlerts = alerts.filter(alert => {
        if (severityFilter !== "ALL" && alert.severity !== severityFilter) return false;
        return true;
    });

    const getSeverityIcon = (level: string) => {
        switch (level) {
            case "CRITICAL": return <AlertCircle className="w-4 h-4 text-red-500" />;
            case "WARNING": return <TriangleAlert className="w-4 h-4 text-amber-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const getSeverityBadgeClass = (level: string) => {
        switch (level) {
            case "CRITICAL": return "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
            case "WARNING": return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
            default: return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
        }
    };

    const columns: ColumnDef<DeviceAlert>[] = [
        {
            header: "Data / Hora",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                        {format(new Date(item.createdAt), "dd MMM yyyy")}
                    </span>
                    <span className="text-xs text-slate-500">
                        {format(new Date(item.createdAt), "HH:mm:ss")}
                    </span>
                </div>
            ),
        },
        {
            header: "Gravidade",
            cell: (item) => (
                <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap", getSeverityBadgeClass(item.severity))}>
                    {getSeverityIcon(item.severity)}
                    <span>
                        {item.severity === "CRITICAL" ? "Crítico" : item.severity === "WARNING" ? "Aviso" : "Info"}
                    </span>
                </div>
            ),
        },
        {
            header: "Experiência",
            cell: (item) => (
                item.experiment ? (
                    <Link href={`/projects/${item.experiment.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">
                        {item.experiment.name}
                    </Link>
                ) : (
                    <span className="text-sm text-slate-400 italic">--</span>
                )
            ),
        },
        {
            header: "Mensagem",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</span>
                    {item.message && <span className="text-xs text-slate-500 max-w-sm truncate" title={item.message}>{item.message}</span>}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Histórico de Alertas</h3>
                
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                            <SelectValue placeholder="Filtrar Gravidade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todas as Gravidades</SelectItem>
                            <SelectItem value="CRITICAL">Crítico</SelectItem>
                            <SelectItem value="WARNING">Aviso</SelectItem>
                            <SelectItem value="INFO">Informação</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DataTable 
                data={filteredAlerts}
                columns={columns}
                keyExtractor={(item) => item.id}
                emptyMessage="Nenhum alerta registado para este dispositivo."
            />
        </div>
    );
}
