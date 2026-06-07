"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import AlertTable from "@/components/haas/alerts/AlertTable"
import { getRecentLogsAction, SystemLogWithUser } from "@/app/(HaaS)/logs/actions"
import { LogFilterMenu, LogLevel } from "./LogFilterMenu"

interface LogsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  hours: number;
}

const LogsDialog = ({ isOpen, onOpenChange, hours }: LogsDialogProps) => {
  const [logs, setLogs] = useState<SystemLogWithUser[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>(["INFO", "WARN", "ERROR", "CRITICAL"]);

  useEffect(() => {
    if (isOpen) {
      const fetchLogs = async () => {
        setIsFetching(true);
        try {
          const data = await getRecentLogsAction(hours, 200);
          setLogs(data.logs);
        } catch (error) {
          console.error("Failed to fetch logs for dialog:", error);
        } finally {
          setIsFetching(false);
        }
      };

      fetchLogs();
    }
  }, [isOpen, hours]);

  const filteredLogs = logs.filter(log => selectedLevels.includes(log.level as LogLevel));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">
            Detalhes dos Logs (Últimas {hours} {hours === 1 ? 'hora' : 'horas'})
          </DialogTitle>
          <div className="flex items-center gap-2 pr-4">
             <LogFilterMenu selectedLevels={selectedLevels} onLevelsChange={setSelectedLevels} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
              <p className="text-sm text-slate-500">A carregar logs...</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6">
                <AlertTable alerts={filteredLogs} />
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogsDialog;
