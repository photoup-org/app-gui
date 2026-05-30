"use client";

import { useState, useEffect } from "react";
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
    deviceSchema: SchemaItem[];
    deviceName: string;
}

export default function DynamicSensorChart({ deviceId, telemetryData, deviceSchema, deviceName }: DynamicSensorChartProps) {
    const [chartData, setChartData] = useState<SensorReading[]>(telemetryData || []);
    const subscribe = useMqttStore(state => state.subscribe);

    useEffect(() => {
        setChartData(telemetryData || []);
    }, [telemetryData]);

    useEffect(() => {
        if (!deviceId) return;

        const topic = `ui/live/device/${deviceId}`;
        
        const unsubscribe = subscribe(topic, (payload: any) => {
            if (!payload) return;
            
            const newReadings: SensorReading[] = [];
            const timestamp = new Date().toISOString();
            
            Object.keys(payload).forEach(key => {
                if (key !== 'timestamp' && key !== 'device_id') {
                    newReadings.push({
                        id: Math.random().toString(36).substring(7),
                        deviceId: deviceId,
                        metricType: key,
                        value: Number(payload[key]),
                        timestamp: timestamp
                    });
                }
            });

            if (newReadings.length > 0) {
                setChartData(prev => {
                    const combined = [...prev, ...newReadings];
                    return combined.slice(-1000);
                });
            }
        });

        return () => unsubscribe();
    }, [deviceId, subscribe]);
    if (!deviceSchema || deviceSchema.length === 0) {
        return (
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm col-span-full">
                <CardHeader>
                    <CardTitle className="text-lg">{deviceName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-slate-500 py-8 text-center border border-dashed rounded-lg">
                        Nenhum esquema de telemetria definido para este dispositivo.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {deviceSchema.map((schemaItem) => {
                const metricData = chartData
                    .filter((reading) => reading.metricType === schemaItem.key)
                    .map((reading) => ({
                        ...reading,
                        formattedTime: format(new Date(reading.timestamp), "HH:mm:ss"),
                        numericValue: Number(reading.value)
                    }));

                return (
                    <Card key={schemaItem.key} className="border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-500 overflow-hidden group">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {schemaItem.label} ({schemaItem.unit})
                            </CardTitle>
                            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                {deviceName}
                            </span>
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
                                                domain={[schemaItem.min, schemaItem.max]} 
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
                                                itemStyle={{ color: schemaItem.color }}
                                                formatter={(value: any) => [`${value} ${schemaItem.unit}`, schemaItem.label]}
                                                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="numericValue" 
                                                stroke={schemaItem.color} 
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
            })}
        </>
    );
}
