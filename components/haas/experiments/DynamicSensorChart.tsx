"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format } from "date-fns";
import { useMqttStore } from "@/hooks/useMqttStore";

export interface SchemaItem {
    key: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    color: string;
}

export interface SensorReading {
    id: string;
    deviceId: string;
    metricType: string;
    value: number;
    timestamp: Date | string;
}

interface DynamicSensorChartProps {
    deviceId: string;
    telemetryData: SensorReading[];
    metricKey: string;
    chartTitle: string;
    unit: string;
    color: string;
    min: number;
    max: number;
    deviceLabel: string;
    experimentStatus: string;
}

export default function DynamicSensorChart({ 
    deviceId, 
    telemetryData, 
    metricKey, 
    chartTitle, 
    unit, 
    color, 
    min, 
    max, 
    deviceLabel, 
    experimentStatus 
}: DynamicSensorChartProps) {
    const storeChartSeriesRaw = useMqttStore(state => state.chartSeries[deviceId]);
    const liveValuesRaw = useMqttStore(state => state.liveValues[deviceId]);
    const subscribe = useMqttStore(state => state.subscribe);

    useEffect(() => {
        if (!deviceId) return;

        // Trigger subscriptions so the client requests data from the broker. 
        // We pass a no-op callback since the global store handles state updates.
        const unsubRaw = subscribe(`ui/live/device/${deviceId}/raw`, () => { });
        const unsubSync = subscribe(`ui/live/device/${deviceId}/sync`, () => { });

        return () => {
            unsubRaw();
            unsubSync();
        };
    }, [deviceId, subscribe]);

    const storeChartSeries = storeChartSeriesRaw || [];
    const liveValues = liveValuesRaw || {};

    const chartData = [...(telemetryData || []), ...storeChartSeries].slice(-1000);
    
    const metricData = chartData
        .filter((reading) => reading.metricType === metricKey)
        .map((reading) => ({
            ...reading,
            formattedTime: format(new Date(reading.timestamp), "HH:mm:ss"),
            numericValue: Number(reading.value)
        }));

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-500 overflow-hidden group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {chartTitle} ({unit})
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                        Sensor: {deviceLabel}
                    </span>
                </div>
                {(experimentStatus === "RUNNING" || experimentStatus === "PAUSED") && <div className="text-2xl font-bold">
                    {liveValues[metricKey] !== undefined ? (
                        liveValues[metricKey].toFixed(2)
                    ) : (
                        <span className="text-sm text-muted-foreground animate-pulse">A obter medição...</span>
                    )}
                </div>}
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full mt-4">
                    {metricData.length === 0 ? (
                        <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 border border-dashed rounded-lg">
                            Sem dados registados
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metricData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis
                                    dataKey="formattedTime"
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    domain={[min, max]}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={45}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                        fontSize: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: color }}
                                    formatter={(value: any) => [`${value.toFixed(2)} ${unit}`, chartTitle]}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="numericValue"
                                    stroke={color}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
