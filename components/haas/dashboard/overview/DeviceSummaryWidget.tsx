import { QrCode, SignalHigh, MoreVertical } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getDeviceUI } from "@/lib/hardware-map";
import { DeviceWithProduct, SensorSummary } from "@/lib/data/overview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeviceActionMenu } from "../../devices/DeviceActionMenu";

export function DeviceSummaryWidget({ data }: { data: SensorSummary }) {
  const pendingCount = data.pending?.length || 0;
  const activeCount = data.active.length;
  const totalCount = activeCount + pendingCount;

  return (
    <Card className="flex flex-col h-full shrink-0 w-80 mb-0">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="font-bold text-slate-900 dark:text-white">
          Sensores Ativos ({totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pr-2">
        <ScrollArea className="h-full pr-4">
          <div className="flex flex-col gap-4">
            {totalCount === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum sensor ativo no momento.</p>
            ) : (
              <>
                {/* Render Pending devices first with higher priority to show listening state */}
                {data.pending?.map((device) => {
                  return <PendingDeviceComponent key={device.id} device={device} />
                })}
                {data.active.map((device) => {
                  return <OnlineDeviceComponent key={device.id} device={device} />
                })}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


const PendingDeviceComponent = ({ device }: { device: DeviceWithProduct }) => {
  const { icon: Icon, bgColor, textColor } = getDeviceUI(device.product.name);

  return (
    <div className="flex items-center justify-between opacity-85 group hover:opacity-100 transition-opacity">
      {/* Left: Icon & Text */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor} ${textColor} relative`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{device.product.name}</span>
          <span className="text-xs text-slate-400">...{device.serialNumber.slice(-12)}</span>
        </div>
      </div>

      {/* Right: Pulsing status badge & Menu */}
      <div className="flex items-center gap-2">
        {/* <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-full animate-pulse tracking-wide whitespace-nowrap">
          A aguardar sinal...
        </span> */}
        <span className="relative flex h-2 w-2" title="A aguardar primeira conexão...">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
        </span>
        <DeviceActionMenu deviceId={device.id} />
      </div>
    </div>
  );
}


const OnlineDeviceComponent = ({ device }: { device: DeviceWithProduct }) => {
  const { icon: Icon, bgColor, textColor } = getDeviceUI(device.product.name);

  return <div className="flex items-center justify-between">
    {/* Left: Icon & Text */}
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bgColor} ${textColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{device.product.name}</span>
        <span className="text-xs text-slate-400">...{device.serialNumber.slice(-12)}</span>
      </div>
    </div>

    {/* Right: Signal & Menu */}
    <div className="flex items-center gap-2 text-slate-400">
      <SignalHigh className="w-4 h-4 text-emerald-500" />
      <DeviceActionMenu deviceId={device.id} />
    </div>
  </div>
}