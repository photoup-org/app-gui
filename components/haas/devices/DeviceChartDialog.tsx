"use client";

import { useState, useEffect } from "react";
import { useDeviceDialogStore } from "@/hooks/useDeviceDialogStore";
import { useMqttStore } from "@/hooks/useMqttStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface TelemetryPayload {
  ph: number;
  temp: number;
}

interface ChartDataPoint {
  timestamp: string;
  ph: number;
  temp: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-3 rounded-xl shadow-lg text-xs font-medium">
        <p className="text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">{label}</p>
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: item.stroke }} />
            <span className="text-slate-600 dark:text-slate-400">{item.name}:</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              {item.value.toFixed(2)}
              {item.name === "pH" ? "" : " °C"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DeviceChartDialog() {
  const { activeDialog, activeDeviceId, closeDialog } = useDeviceDialogStore();
  const isConnected = useMqttStore((state) => state.isConnected);
  const subscribe = useMqttStore((state) => state.subscribe);
  const [data, setData] = useState<ChartDataPoint[]>([]);

  const isOpen = activeDialog === 'CHART' && activeDeviceId !== null;

  useEffect(() => {
    if (!isOpen || !activeDeviceId) {
      setData([]);
      return;
    }

    const topic = `telemetry/${activeDeviceId}`;
    console.log(`[Chart] Subscribing to MQTT topic: ${topic}`);

    const unsubscribe = subscribe(topic, (payload: TelemetryPayload) => {
      const newPoint: ChartDataPoint = {
        timestamp: new Date().toLocaleTimeString('pt-PT', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        ph: Number(payload.ph),
        temp: Number(payload.temp),
      };
      setData((prev) => {
        const next = [...prev, newPoint];
        // Keep a rolling window of max 30 points
        if (next.length > 30) {
          next.shift();
        }
        return next;
      });
    });

    return () => {
      console.log(`[Chart] Unsubscribing from MQTT topic: ${topic}`);
      unsubscribe();
    };
  }, [isOpen, activeDeviceId, subscribe]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-[700px] border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl shadow-2xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col gap-1.5">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Gráficos em Tempo Real
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
              Visualização de telemetria live para o ID: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeDeviceId}</span>
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all">
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/30 dark:border-emerald-800/30">
                <Wifi className="w-3.5 h-3.5 animate-pulse" />
                Broker Ativo
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200/30 dark:border-rose-800/30">
                <WifiOff className="w-3.5 h-3.5" />
                Desconectado
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="relative h-[350px] w-full mt-4 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-inner p-4">
          {data.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-center p-6 max-w-sm">
              {isConnected ? (
                <>
                  <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">A aguardar telemetria...</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Ligado ao broker. Publique dados em <code className="bg-slate-200/50 dark:bg-slate-800/50 px-1 py-0.5 rounded text-rose-500 font-mono text-[10px]">telemetry/{activeDeviceId}</code> para iniciar.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="w-8 h-8 text-rose-400" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Sem ligação com o Broker</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Por favor certifique-se que o broker MQTT está ativo em <code className="bg-slate-200/50 dark:bg-slate-800/50 px-1 py-0.5 rounded font-mono text-[10px]">ws://localhost:9001</code>.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800/60" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 14]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#06b6d4', fontSize: 10 }}
                  label={{ value: 'pH', angle: -90, position: 'insideLeft', fill: '#06b6d4', fontSize: 11, fontWeight: 'bold', offset: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#f97316', fontSize: 10 }}
                  label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fill: '#f97316', fontSize: 11, fontWeight: 'bold', offset: 10 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontWeight: 500 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ph"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="pH"
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="temp"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Temperatura"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
