"use client";

import React from "react";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { DeviceActionsMenu, DeviceProp } from "@/app/(HaaS)/inventory/_components/DeviceActionsMenu";
import { Badge } from "@/components/ui/badge";
import { ServerCrash, Activity } from "lucide-react";

export type InventoryDevice = DeviceProp & {
  serialNumber: string;
  product: {
    name: string;
    type: string;
  };
};

interface InventoryClientProps {
  devices: InventoryDevice[];
}

export function InventoryClient({ devices }: InventoryClientProps) {
  const gateways = devices.filter((d) => d.product.type === "GATEWAY");
  const sensors = devices.filter((d) => d.product.type !== "GATEWAY");

  const columns: ColumnDef<InventoryDevice>[] = [
    {
      header: "Dispositivo",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {item.name || item.product.name}
          </span>
          <span className="text-xs text-slate-500">{item.serialNumber}</span>
        </div>
      ),
    },
    {
      header: "Produto",
      cell: (item) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {item.product.name}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item) => {
        const isBusy = item.experiments && item.experiments.length > 0;
        if (isBusy) {
          return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Em Uso</Badge>;
        }

        switch (item.status) {
          case 'ACTIVE':
            return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Disponível</Badge>;
          case 'MAINTENANCE':
            return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Manutenção</Badge>;
          case 'DISABLED':
            return <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50">Desligado</Badge>;
          case 'PENDING_CONNECTION':
            return <Badge variant="outline" className="text-wait-connection border-wait-connection bg-wait-connection/5">Pendente</Badge>;
          default:
            return <Badge variant="outline">{item.status}</Badge>;
        }
      },
    },
    {
      header: "Ações",
      className: "w-16 text-right",
      cell: (item) => (
        <DeviceActionsMenu device={item} />
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <ServerCrash className="h-5 w-5 text-indigo-500" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Gateways ({gateways.length})
          </h2>
        </div>
        <DataTable
          data={gateways}
          columns={columns}
          keyExtractor={(item) => item.id}
          emptyMessage="Nenhum gateway encontrado."
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <Activity className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Sensores ({sensors.length})
          </h2>
        </div>
        <DataTable
          data={sensors}
          columns={columns}
          keyExtractor={(item) => item.id}
          emptyMessage="Nenhum sensor encontrado."
        />
      </div>
    </>
  );
}
