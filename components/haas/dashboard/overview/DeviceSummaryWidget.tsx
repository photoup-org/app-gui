"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignalHigh } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getDeviceUI } from "@/lib/hardware-map";
import { DeviceWithProduct, SensorSummary } from "@/lib/data/overview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeviceActionMenu } from "../../devices/DeviceActionMenu";
import { useMqttStore } from "@/hooks/useMqttStore";

export function DeviceSummaryWidget({ data }: { data: SensorSummary }) {
  const liveDevices = useMqttStore((state) => state.liveDevices);
  const lastRegistrationUpdate = useMqttStore((state) => state.lastRegistrationUpdate);
  const router = useRouter();

  useEffect(() => {
    if (lastRegistrationUpdate > 0) {
      router.refresh();
    }
  }, [lastRegistrationUpdate, router]);

  const pendingDevices = data.pending || [];
  const activeDevices = data.active || [];

  const busyList: DeviceWithProduct[] = [];
  const onlineList: DeviceWithProduct[] = [];
  const offlineList: DeviceWithProduct[] = [];

  for (const device of activeDevices) {
    const mqttData = liveDevices[device.id];
    const isPhysicallyOnline = mqttData?.status === 'online' || mqttData?.status === 'busy';

    if (isPhysicallyOnline) {
      if (mqttData?.status === 'busy') {
        busyList.push(device);
      } else {
        onlineList.push(device);
      }
    } else {
      offlineList.push(device);
    }
  }

  const totalCount = pendingDevices.length + activeDevices.length;

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
                {pendingDevices.map((device) => {
                  const mqttStatus = liveDevices[device.id]?.status;
                  return <PendingDeviceComponent key={device.id} device={device} mqttStatus={mqttStatus} />
                })}
                {busyList.map((device) => {
                  const mqttStatus = liveDevices[device.id]?.status;
                  return <OnlineDeviceComponent key={device.id} device={device} mqttStatus={mqttStatus} />
                })}
                {onlineList.map((device) => {
                  const mqttStatus = liveDevices[device.id]?.status;
                  return <OnlineDeviceComponent key={device.id} device={device} mqttStatus={mqttStatus} />
                })}
                {offlineList.map((device) => {
                  const mqttStatus = liveDevices[device.id]?.status;
                  return <OnlineDeviceComponent key={device.id} device={device} mqttStatus={mqttStatus} />
                })}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


const PendingDeviceComponent = ({ device, mqttStatus }: { device: DeviceWithProduct, mqttStatus?: string }) => {
  const { icon: Icon, bgColor, textColor } = getDeviceUI(device.product.name);
  const isLiveOnline = mqttStatus === 'online';

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
        <span className="relative flex h-2 w-2" title={isLiveOnline ? "Conectado" : "A aguardar primeira conexão..."}>
          {isLiveOnline ? (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </>
          )}
        </span>
        <DeviceActionMenu deviceId={device.id} />
      </div>
    </div>
  );
}


const OnlineDeviceComponent = ({ device, mqttStatus }: { device: DeviceWithProduct, mqttStatus?: string }) => {
  const { icon: Icon, bgColor, textColor } = getDeviceUI(device.product.name);

  // STRICT OVERRIDE - Offline by default unless explicitly online/busy
  const isVisuallyActive = mqttStatus === 'online' || mqttStatus === 'busy';

  const actualBgColor = isVisuallyActive ? bgColor : "bg-slate-100 dark:bg-slate-800";
  const actualTextColor = isVisuallyActive ? textColor : "text-slate-400";

  return <div className={`flex items-center justify-between ${!isVisuallyActive ? 'opacity-60' : ''}`}>
    {/* Left: Icon & Text */}
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${actualBgColor} ${actualTextColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{device.product.name}</span>
        <span className="text-xs text-slate-400">...{device.serialNumber.slice(-12)}</span>
      </div>
    </div>

    {/* Right: Signal & Menu */}
    <div className="flex items-center gap-2 text-slate-400">
      {mqttStatus === 'busy' && (
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full whitespace-nowrap">
          Em Utilização
        </span>
      )}
      {/* {!isVisuallyActive && (
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full whitespace-nowrap">
          Offline
        </span>
      )} */}
      <SignalHigh className={`w-4 h-4 ${isVisuallyActive ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
      <DeviceActionMenu disabled={!isVisuallyActive} deviceId={device.id} />
    </div>
  </div>
}