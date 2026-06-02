"use client";

import React, { useState, useTransition } from "react";
import { DeviceStatus } from "@prisma/client";
import { MoreHorizontal, Edit, PowerOff, Power, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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

export interface DeviceProp {
  id: string;
  name: string | null;
  status: DeviceStatus;
  experiments?: { id: string }[];
}

export function DeviceActionsMenu({ device }: { device: DeviceProp }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newName, setNewName] = useState(device.name || "");

  // "device.experiments.length > 0" indicates it's IN_USE
  const isBusy = device.experiments && device.experiments.length > 0;

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
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem disabled={blockMenu} onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Nome
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleUpdateStatus('MAINTENANCE')}
            disabled={blockMenu || device.status === 'MAINTENANCE'}
          >
            <Wrench className="mr-2 h-4 w-4" />
            Colocar em Manutenção
          </DropdownMenuItem>

          {device.status === 'DISABLED' ? (
            <DropdownMenuItem
              onClick={() => handleUpdateStatus('ACTIVE')}
              disabled={blockMenu}
            >
              <Power className="mr-2 h-4 w-4" />
              Ativar Sensor
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => handleUpdateStatus('DISABLED')}
              disabled={blockMenu}
            >
              <PowerOff className="mr-2 h-4 w-4" />
              Desligar Sensor
            </DropdownMenuItem>
          )}

          {device.status === 'MAINTENANCE' && (
            <DropdownMenuItem
              onClick={() => handleUpdateStatus('ACTIVE')}
              disabled={blockMenu}
            >
              <Power className="mr-2 h-4 w-4" />
              Colocar em Operação
            </DropdownMenuItem>
          )}

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
    </>
  );
}
