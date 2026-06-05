"use client";

import React, { useEffect, useMemo } from "react";
import { useMqttStore } from "@/hooks/useMqttStore";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { SENSOR_DICTIONARY, SchemaItem } from "@/lib/sensor-schemas";
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

interface DeviceLiveTelemetryProps {
    deviceId: string;
    sku: string;
}

const CustomTooltip = ({ active, payload, label, capabilities }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-3 rounded-xl shadow-lg text-xs font-medium z-50">
        <p className="text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">{label}</p>
        {payload.map((item: any, index: number) => {
          const cap = capabilities.find((c: any) => c.key === item.dataKey);
          return (
            <div key={index} className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: item.stroke }} />
              <span className="text-slate-600 dark:text-slate-400">{item.name}:</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">
                {item.value?.toFixed(2) ?? '-'}
                {cap ? ` ${cap.unit}` : ''}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const EMPTY_ARRAY: any[] = [];

export function DeviceLiveTelemetry({ deviceId, sku }: DeviceLiveTelemetryProps) {
    const isConnected = useMqttStore(state => state.isConnected);
    const departmentId = useMqttStore(state => state.departmentId);
    const rawChartSeries = useMqttStore(state => state.chartSeries[deviceId]) || EMPTY_ARRAY;
    const subscribe = useMqttStore(state => state.subscribe);
    const clearDeviceTelemetry = useMqttStore((state) => state.clearDeviceTelemetry);

    const capabilities = SENSOR_DICTIONARY[sku] || [];

    useEffect(() => {
        if (!deviceId || !departmentId) return;

        const topic = `ui/live/department/${departmentId}/device/${deviceId}/sync`;
        const unsubscribe = subscribe(topic, () => { });
        
        return () => {
            unsubscribe();
            // Don't clear on unmount if we want to keep data while navigating, 
            // but to mimic the dialog behavior cleanly:
            // clearDeviceTelemetry(deviceId); 
            // Actually it's better to NOT clear it here so it persists if they switch tabs
        };
    }, [deviceId, departmentId, subscribe]);

    const data = useMemo(() => {
        if (!deviceId || rawChartSeries.length === 0) return [];
    
        const grouped = rawChartSeries.reduce((acc: Record<string, any>, curr: any) => {
          const ts = curr.timestamp;
          if (!acc[ts]) {
            acc[ts] = {
              timestamp: new Date(ts).toLocaleTimeString('pt-PT', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }),
            };
          }
          const metricKey = curr.metricType === 'temp' ? 'temperature' : curr.metricType;
          acc[ts][metricKey] = curr.value;
          return acc;
        }, {});
    
        // Keep a rolling window of max 30 points
        return Object.values(grouped).slice(-30);
    }, [rawChartSeries, deviceId]);

    const uniqueDomains = Array.from(new Set(capabilities.map(c => `${c.min}-${c.max}`)));
    const axesToRender = uniqueDomains.map((domainStr, index) => {
        const cap = capabilities.find(c => `${c.min}-${c.max}` === domainStr)!;
        return {
            id: `axis-${index}`,
            orientation: (index % 2 === 0 ? "left" : "right") as "left" | "right",
            min: cap.min,
            max: cap.max,
            unit: cap.unit,
            color: cap.color
        };
    });

    const getAxisIdForCap = (cap: SchemaItem) => {
        const domainIndex = uniqueDomains.indexOf(`${cap.min}-${cap.max}`);
        return `axis-${domainIndex}`;
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Live Telemetry</h3>
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
            </div>

            <div className="relative flex-1 w-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-inner p-4 min-h-[300px]">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 text-center p-6 max-w-sm">
                    {isConnected ? (
                        <>
                        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">A aguardar telemetria...</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Aguardando publicação de dados deste dispositivo no broker MQTT.
                            </p>
                        </div>
                        </>
                    ) : (
                        <>
                        <WifiOff className="w-8 h-8 text-rose-400" />
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Sem ligação com o Broker</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            A ligação em tempo real está indisponível.
                            </p>
                        </div>
                        </>
                    )}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800/60" vertical={false} />
                            <XAxis
                                dataKey="timestamp"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                            />
                            {axesToRender.map((axis) => (
                                <YAxis
                                    key={axis.id}
                                    yAxisId={axis.id}
                                    orientation={axis.orientation}
                                    domain={[axis.min, axis.max]}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: axis.color, fontSize: 10 }}
                                    label={{
                                        value: axis.unit,
                                        angle: axis.orientation === "left" ? -90 : 90,
                                        position: axis.orientation === "left" ? 'insideLeft' : 'insideRight',
                                        fill: axis.color,
                                        fontSize: 11,
                                        fontWeight: 'bold',
                                        offset: 10
                                    }}
                                />
                            ))}
                            <Tooltip content={<CustomTooltip capabilities={capabilities} />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '11px', fontWeight: 500 }}
                            />
                            {capabilities.map((cap) => (
                                <Line
                                    key={cap.key}
                                    yAxisId={getAxisIdForCap(cap)}
                                    type="monotone"
                                    dataKey={cap.key}
                                    stroke={cap.color}
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    name={cap.label}
                                    isAnimationActive={false}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
