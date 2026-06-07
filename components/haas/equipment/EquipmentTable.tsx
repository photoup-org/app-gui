"use client";

import { Device, HardwareProduct } from "@prisma/client";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

type DeviceWithProduct = Device & {
  product: Pick<HardwareProduct, "id" | "name" | "type">;
  experiments?: { id: string }[];
};

const STATUS_UI_MAP: Record<string, { label: string, colorClass: string }> = {
  'IN_USE': { label: 'Em Utilização', colorClass: 'bg-blue-500 text-white' },
  'ACTIVE': { label: 'Disponível', colorClass: 'bg-teal-500 text-white' },
  'OFFLINE': { label: 'Offline', colorClass: 'bg-gray-400 text-white' },
  'MAINTENANCE': { label: 'Em Manutenção', colorClass: 'bg-red-500 text-white' },
  'UNCLAIMED': { label: 'Não Alocado', colorClass: 'bg-gray-200 text-gray-800' },
  'PENDING_CONNECTION': { label: 'Pendente', colorClass: 'border border-wait-connection text-wait-connection' }
};

interface EquipmentTableProps {
  devices: DeviceWithProduct[];
}

export function EquipmentTable({ devices }: EquipmentTableProps) {
  const columns: ColumnDef<DeviceWithProduct>[] = [
    {
      header: "Nome",
      className: "font-medium",
      cell: (device) => device.product.name,
    },
    {
      header: "S/N",
      className: "text-muted-foreground font-mono text-xs",
      cell: (device) => device.serialNumber,
    },
    {
      header: "Tipo",
      cell: (device) => {
        let typeLabel = device.product.type;
        if (typeLabel === "GATEWAY") return "Gateway";
        if (typeLabel.includes("SENSOR")) return "Sensor";
        return typeLabel;
      },
    },
    {
      header: "Estado",
      cell: (device) => {
        const isBusy = device.experiments && device.experiments.length > 0;
        const effectiveStatus = isBusy ? "IN_USE" : device.status;
        const uiConfig = STATUS_UI_MAP[effectiveStatus] || {
          label: effectiveStatus,
          colorClass: 'bg-gray-200 text-black'
        };

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider ${uiConfig.colorClass}`}>
            {uiConfig.label}
          </span>
        );
      },
    }
  ];

  return (
    <DataTable
      data={devices}
      columns={columns}
      keyExtractor={(device) => device.id}
      emptyMessage="Nenhum equipamento alocado"
    />
  );
}
