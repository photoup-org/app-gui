"use client";

import { useDeviceDialogStore } from "@/hooks/useDeviceDialogStore";
import { identifyDeviceAction, rebootDeviceAction } from "@/actions/devices";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MoreVertical, Info, Activity, Lightbulb, Power } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DeviceActionMenuProps {
  deviceId: string;
}

export function DeviceActionMenu({ deviceId }: DeviceActionMenuProps) {
  const { openDialog } = useDeviceDialogStore();

  const handleIdentify = async () => {
    toast.info("A enviar comando de identificação...");
    const res = await identifyDeviceAction(deviceId);
    if (res.success) toast.success("Comando enviado com sucesso!");
  };

  const handleReboot = async () => {
    toast.info("A reiniciar dispositivo...");
    const res = await rebootDeviceAction(deviceId);
    if (res.success) toast.success("Sinal de reinicialização emitido.");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
          <span className="sr-only">Abrir menu de ações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-md">
        <DropdownMenuItem onClick={() => openDialog('DETAILS', deviceId)} className="cursor-pointer">
          Ver Detalhes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openDialog('CHART', deviceId)} className="cursor-pointer">
          Gráficos em Tempo Real
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleIdentify} className="cursor-pointer">
          Identificar Dispositivo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleReboot} className="cursor-pointer ">
          Reiniciar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
