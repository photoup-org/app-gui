"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format } from "date-fns";

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
    telemetryData: SensorReading[];
    deviceSchema: SchemaItem[];
    deviceName: string;
}

export default function DynamicSensorChart({ telemetryData, deviceSchema, deviceName }: DynamicSensorChartProps) {
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
                const chartData = telemetryData
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
                                {chartData.length === 0 ? (
                                    <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 border border-dashed rounded-lg">
                                        Sem dados registados
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
                                                formatter={(value: number) => [`${value} ${schemaItem.unit}`, schemaItem.label]}
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
