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
import { getRecentAlertsAction, SystemLogWithUser } from "@/app/(HaaS)/logs/actions"

interface AlertDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  days: number;
}

const AlertDetailsDialog = ({ isOpen, onOpenChange, days }: AlertDetailsDialogProps) => {
  const [alerts, setAlerts] = useState<SystemLogWithUser[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchAlerts = async () => {
        setIsFetching(true);
        try {
          const data = await getRecentAlertsAction(days);
          setAlerts(data.alerts);
        } catch (error) {
          console.error("Failed to fetch alerts for dialog:", error);
        } finally {
          setIsFetching(false);
        }
      };

      fetchAlerts();
    }
  }, [isOpen, days]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold">
            Detalhes dos Alertas (Últimos {days} dias)
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
              <p className="text-sm text-slate-500">A carregar alertas...</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6">
                <AlertTable alerts={alerts} />
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertDetailsDialog;
