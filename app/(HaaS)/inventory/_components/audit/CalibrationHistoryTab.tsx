"use client";

import React, { useState } from "react";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FileText, Calculator } from "lucide-react";
import { CalibrationResultsDialog, CalibrationRecordData } from "./CalibrationResultsDialog";

interface CalibrationHistoryTabProps {
    records: CalibrationRecordData[];
}

export function CalibrationHistoryTab({ records }: CalibrationHistoryTabProps) {
    const [selectedRecord, setSelectedRecord] = useState<CalibrationRecordData | null>(null);

    const columns: ColumnDef<CalibrationRecordData>[] = [
        {
            header: "Data",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                        {format(new Date(item.calibratedAt), "dd MMM yyyy")}
                    </span>
                    <span className="text-xs text-slate-500">
                        {format(new Date(item.calibratedAt), "HH:mm:ss")}
                    </span>
                </div>
            ),
        },
        {
            header: "Operador",
            cell: (item) => (
                <span className="text-sm font-medium">{item.performedBy}</span>
            ),
        },
        {
            header: "Notas",
            cell: (item) => (
                item.notes ? (
                    <div className="flex items-center gap-2 max-w-[200px]">
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-500 truncate" title={item.notes}>
                            {item.notes}
                        </span>
                    </div>
                ) : (
                    <span className="text-sm text-slate-400 italic">--</span>
                )
            ),
        },
        {
            header: "Resultados",
            className: "text-right",
            headerClassName: "text-right",
            cell: (item) => (
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(item);
                    }}
                >
                    <Calculator className="h-4 w-4" />
                    View Results
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <DataTable 
                data={records}
                columns={columns}
                keyExtractor={(item) => item.id}
                emptyMessage="Nenhuma calibração registada para este dispositivo."
            />

            <CalibrationResultsDialog 
                open={!!selectedRecord} 
                onOpenChange={(open) => !open && setSelectedRecord(null)}
                record={selectedRecord}
            />
        </div>
    );
}
