import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Device, HardwareProduct } from "@prisma/client";

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
  'PENDING_CONNECTION': { label: 'Pendente', colorClass: 'border border-purple-500 text-purple-500' }
};

interface EquipmentTableProps {
  devices: DeviceWithProduct[];
}

export function EquipmentTable({ devices }: EquipmentTableProps) {
  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">Nenhum equipamento alocado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>S/N</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => {
            const isBusy = device.experiments && device.experiments.length > 0;
            const effectiveStatus = isBusy ? "IN_USE" : device.status;
            
            const uiConfig = STATUS_UI_MAP[effectiveStatus] || { 
              label: effectiveStatus, 
              colorClass: 'bg-gray-200 text-black' 
            };

            let typeLabel = device.product.type;
            if (typeLabel === "GATEWAY") typeLabel = "Gateway";
            else if (typeLabel.includes("SENSOR")) typeLabel = "Sensor";

            return (
              <TableRow key={device.id}>
                <TableCell className="font-medium">{device.product.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{device.serialNumber}</TableCell>
                <TableCell>{typeLabel}</TableCell>
                <TableCell>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider ${uiConfig.colorClass}`}>
                    {uiConfig.label}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
