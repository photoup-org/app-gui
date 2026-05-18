import { QrCode, SignalHigh, MoreVertical } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getDeviceUI } from "@/lib/hardware-map";
import { DeviceWithProduct, SensorSummary } from "@/lib/data/overview";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DeviceSummaryWidget({ data }: { data: SensorSummary }) {
  return (
    <Card className="flex flex-col h-full shrink-0 w-80 mb-0">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="font-bold text-slate-900 dark:text-white">
          Sensores Online ({data.active.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pr-2">
        <ScrollArea className="h-full pr-4">
          <div className="flex flex-col gap-4">
            {data.active.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum sensor online no momento.</p>
            ) : (
              data.active.map((device) => {
                return <OnlineDeviceComponent key={device.id} device={device} />
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
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
      <MoreVertical className="w-4 h-4 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer" />
    </div>
  </div>
}