"use client";

import { useDeviceDialogStore } from "@/hooks/useDeviceDialogStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeviceDetailsDialog() {
  const { activeDialog, activeDeviceId, closeDialog } = useDeviceDialogStore();

  const isOpen = activeDialog === 'DETAILS' && activeDeviceId !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Dispositivo</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre o dispositivo selecionado.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-slate-500">ID do Dispositivo: <span className="font-medium text-slate-900 dark:text-slate-100">{activeDeviceId}</span></p>
          {/* Add more details here in the future */}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => {}}>Calibrar</Button>
          <Button onClick={() => {}}>Editar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
