"use client";

import { useDeviceDialogStore } from "@/hooks/useDeviceDialogStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ResponsiveContainer } from "recharts";

export function DeviceChartDialog() {
  const { activeDialog, activeDeviceId, closeDialog } = useDeviceDialogStore();

  const isOpen = activeDialog === 'CHART' && activeDeviceId !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gráficos em Tempo Real</DialogTitle>
          <DialogDescription>
            Visualização de dados em tempo real para o dispositivo {activeDeviceId}.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[300px] w-full mt-4 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <div className="flex items-center justify-center h-full w-full text-slate-400 text-sm absolute">
              Área do Gráfico (A aguardar stream de dados)
            </div>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
