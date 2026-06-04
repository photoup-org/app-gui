"use client";

import React, { useState, useTransition } from "react";
import { DeviceStatus } from "@prisma/client";
import { MoreHorizontal, Edit, PowerOff, Power, Wrench, Activity, Info, LineChart, Lightbulb, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDeviceDialogStore } from "@/hooks/useDeviceDialogStore";
import { identifyDeviceAction, rebootDeviceAction } from "@/actions/devices";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDeviceNameAction, updateDeviceStatusAction } from "@/app/(HaaS)/equipment/actions";
import { SENSOR_CALIBRATION_DICTIONARY } from "@/lib/sensor-schemas";
import { CalibrationWizard } from "./CalibrationWizard";

export interface DeviceProp {
  id: string;
  name: string | null;
  status: DeviceStatus;
  departmentId: string;
  product: {
    sku: string;
    name?: string;
  };
  experiments?: { id: string }[];
}

export function DeviceActionsMenu({ device }: { device: DeviceProp }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCalibrationWizardOpen, setIsCalibrationWizardOpen] = useState(false);
  const [newName, setNewName] = useState(device.name || "");

  const calibrationConfig = SENSOR_CALIBRATION_DICTIONARY[device.product.sku];

  // "device.experiments.length > 0" indicates it's IN_USE
  const isBusy = device.experiments && device.experiments.length > 0;

  const { openDialog } = useDeviceDialogStore();

  const handleIdentify = async () => {
    toast.info("A enviar comando de identificação...");
    startTransition(async () => {
      const result = await identifyDeviceAction(device.id);
      if (result.success) toast.success("Comando enviado com sucesso!");
      else toast.error(result.error || "Erro ao identificar");
    });
  };

  const handleReboot = async () => {
    toast.info("A reiniciar dispositivo...");
    startTransition(async () => {
      const result = await rebootDeviceAction(device.id);
      if (result.success) toast.success("Sinal de reinicialização emitido.");
      else toast.error(result.error || "Erro ao reiniciar");
    });
  };

  const handleUpdateStatus = (newStatus: DeviceStatus) => {
    startTransition(async () => {
      const result = await updateDeviceStatusAction(device.id, newStatus);
      if (result.success) {
        toast.success(`Status do dispositivo atualizado para ${newStatus}`);
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao atualizar status");
      }
    });
  };

  const handleUpdateName = () => {
    startTransition(async () => {
      const result = await updateDeviceNameAction(device.id, newName);
      if (result.success) {
        toast.success("Nome do dispositivo atualizado com sucesso");
        setIsEditDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao atualizar nome");
      }
    });
  };

  const blockMenu = React.useMemo(() => {
    return isBusy || device.status === 'PENDING_CONNECTION';
  }, [isBusy, device.status]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={blockMenu} variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild disabled={blockMenu}>
              <Link href={`/inventory/${device.id}`} className="cursor-pointer flex w-full">
                <Info className="mr-2 h-4 w-4" />
                Ver Detalhes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled={blockMenu} onClick={() => openDialog('CHART', device.id, device.product.sku, device.name || device.product.name)} className="cursor-pointer">
              <LineChart className="mr-2 h-4 w-4" />
              Gráficos em Tempo Real
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem disabled={blockMenu} onClick={() => setIsEditDialogOpen(true)} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Editar Nome
            </DropdownMenuItem>
            {calibrationConfig && (
              <DropdownMenuItem disabled={blockMenu} onClick={() => setIsCalibrationWizardOpen(true)} className="cursor-pointer">
                <Activity className="mr-2 h-4 w-4" />
                Calibrar Sensor
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem disabled={blockMenu} onClick={handleIdentify} className="cursor-pointer">
              <Lightbulb className="mr-2 h-4 w-4" />
              Identificar Dispositivo
            </DropdownMenuItem>
            <DropdownMenuItem disabled={blockMenu} onClick={handleReboot} className="cursor-pointer">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reiniciar
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => handleUpdateStatus(device.status === 'MAINTENANCE' ? 'ACTIVE' : 'MAINTENANCE')}
              disabled={blockMenu && device.status !== 'MAINTENANCE'}
              className="cursor-pointer"
            >
              <Wrench className="mr-2 h-4 w-4" />
              {device.status === 'MAINTENANCE' ? 'Remover de Manutenção' : 'Colocar em Manutenção'}
            </DropdownMenuItem>

            {device.status === 'DISABLED' ? (
              <DropdownMenuItem
                onClick={() => handleUpdateStatus('ACTIVE')}
                disabled={blockMenu}
                className="cursor-pointer"
              >
                <Power className="mr-2 h-4 w-4" />
                Ativar Sensor
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => handleUpdateStatus('DISABLED')}
                disabled={blockMenu}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <PowerOff className="mr-2 h-4 w-4" />
                Desligar Sensor
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Nome do Dispositivo</DialogTitle>
            <DialogDescription>
              Altere o nome amigável para identificar este dispositivo no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isPending} onClick={handleUpdateName}>
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {calibrationConfig && (
        <CalibrationWizard
          isOpen={isCalibrationWizardOpen}
          onClose={() => setIsCalibrationWizardOpen(false)}
          deviceId={device.id}
          departmentId={device.departmentId}
          deviceName={device.name || device.product.name || "Sensor"}
          config={calibrationConfig}
          metricKey="ph" // Assuming ph for now since it's the only supported one
          metricLabel="pH"
        />
      )}
    </>
  );
}
