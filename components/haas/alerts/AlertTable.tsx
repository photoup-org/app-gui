"use client"

import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertCircle, TriangleAlert, Info } from "lucide-react"
import { SystemLogWithUser } from "@/app/(HaaS)/logs/actions"
import { cn } from "@/lib/utils"

interface AlertTableProps {
  alerts: SystemLogWithUser[];
}

const AlertTable = ({ alerts }: AlertTableProps) => {
  const formatLogDate = (dateVal: Date | string) => {
    const d = new Date(dateVal);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${day}/${month} - ${hours}:${minutes}`;
  };

  const getSeverityIcon = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "ERROR":
      case "WARN":
        return <TriangleAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBadgeClass = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
      case "ERROR":
      case "WARN":
        return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      default:
        return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 border rounded-lg border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <Info className="w-8 h-8 mb-3 text-slate-400" />
        <p className="text-sm font-medium">Nenhum alerta encontrado no período selecionado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[180px]">Data / Hora</TableHead>
            <TableHead className="w-[120px]">Gravidade</TableHead>
            <TableHead>Mensagem</TableHead>
            <TableHead className="w-[200px]">Equipamento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => (
            <TableRow key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
              <TableCell className="font-medium text-slate-600 dark:text-slate-300">
                {formatLogDate(alert.timestamp)}
              </TableCell>
              <TableCell>
                <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap", getSeverityBadgeClass(alert.level))}>
                  {getSeverityIcon(alert.level)}
                  <span>
                    {alert.level === "CRITICAL" ? "Crítico" : alert.level === "ERROR" || alert.level === "WARN" ? "Aviso" : "Info"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-slate-600 dark:text-slate-300">
                {alert.message}
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 leading-none mb-1">
                    {alert.metadata && typeof alert.metadata === 'object' && 'deviceName' in alert.metadata && (alert.metadata as any).deviceName
                      ? (alert.metadata as any).deviceName
                      : (alert.device?.product?.name || "")}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 leading-none">
                    {alert.metadata && typeof alert.metadata === 'object' && 'deviceSn' in alert.metadata && (alert.metadata as any).deviceSn
                      ? (alert.metadata as any).deviceSn
                      : (alert.device?.serialNumber || "-")}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AlertTable;
