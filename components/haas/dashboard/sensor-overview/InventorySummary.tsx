"use client"

import { useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useInventoryDialogStore, InventoryCategory } from "@/hooks/useInventoryDialogStore";
import { InventoryListDialog } from "../InventoryListDialog";

interface InventorySummaryProps {
    data: {
        online: number;
        offline: number;
        maintenance: number;
        pending: number;
        total: number;
    }
}

const InventorySummary = ({ data }: InventorySummaryProps) => {
    const { openDialog } = useInventoryDialogStore();
    // Data mapping for Recharts Donut Pie Chart
    const chartData = [
        { name: "Em Utilização", value: data.online, color: "#3b82f6" }, // bg-blue-500 / #3b82f6
        { name: "Em Manutenção", value: data.maintenance, color: "#ef4444" }, // bg-red-500 / #ef4444
        { name: "A Aguardar Ligação", value: data.pending, color: "#a855f7" }, // bg-purple-500 / #a855f7
        { name: "Offline", value: data.offline, color: "#e2e8f0" } // bg-slate-200 / #e2e8f0
    ].filter(item => item.value > 0);

    // If no data points exist, render a full grey circle as fallback
    const displayData = chartData.length === 0
        ? [{ name: "Nenhum Sensor", value: 1, color: "#e2e8f0" }]
        : chartData;

    const handlePieClick = useCallback((entry: any) => {
        let category: InventoryCategory = null;
        if (entry.name === "Offline") category = "OFFLINE";
        if (entry.name === "Em Utilização") category = "ACTIVE";
        if (entry.name === "Em Manutenção") category = "MAINTENANCE";
        if (entry.name === "A Aguardar Ligação") category = "PENDING_CONNECTION";
        
        if (category) {
            openDialog(category);
        }
    }, [openDialog]);

    return (
        <Card className="flex flex-col h-full border border-slate-100 dark:border-slate-800 w-80 shrink-0 mb-0">
            <CardHeader className="pb-4">
                <CardTitle className="font-bold text-slate-900 dark:text-white">
                    Inventário
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between items-center pb-5  px-5 min-h-0">
                {/* Center Text & Donut Chart Wrapper */}
                <div className="relative w-full flex-1 flex items-center justify-center min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={displayData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={displayData.length > 1 ? 4 : 0}
                                dataKey="value"
                                cornerRadius={6}
                                startAngle={180}
                                endAngle={-180}
                                onClick={handlePieClick}
                                style={{ cursor: 'pointer' }}
                            >
                                {displayData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.color} 
                                        className="hover:opacity-80 transition-opacity outline-none"
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Absolute centered label */}
                    <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-5xl font-extrabold text-slate-900 dark:text-white leading-none">
                            {data.total}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                            {data.total === 1 ? "Sensor" : "Sensores"}
                        </span>
                    </div>
                </div>

                {/* Custom Legend using Tailwind CSS flexbox */}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2 w-full">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <span>Offline</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Em Utilização</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span>A Aguardar Ligação</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Em Manutenção</span>
                    </div>
                </div>
            </CardContent>
            <InventoryListDialog />
        </Card>
    )
}

export default InventorySummary