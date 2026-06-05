"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Activity, Box } from "lucide-react";

export interface CalibrationPoint {
    raw: number;
    reference: number;
}

export interface CalibrationSegment {
    m: number;
    b: number;
    rawBoundary: number | null;
    operator: string;
}

export interface CalibrationRecordData {
    id: string;
    calibratedAt: Date;
    performedBy: string;
    pointsApplied: any;
    newConfig: any;
    notes?: string | null;
}

interface CalibrationResultsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record: CalibrationRecordData | null;
}

export function CalibrationResultsDialog({ open, onOpenChange, record }: CalibrationResultsDialogProps) {
    if (!record) return null;

    const points: CalibrationPoint[] = Array.isArray(record.pointsApplied) 
        ? record.pointsApplied 
        : [];
        
    const isSegmented = record.newConfig?.segments && Array.isArray(record.newConfig.segments);
    const segments: CalibrationSegment[] = isSegmented ? record.newConfig.segments : [];
    
    // Fallback for single/two-point without segments array
    const singleM = record.newConfig?.m;
    const singleB = record.newConfig?.b;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] md:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Activity className="h-5 w-5 text-indigo-500" />
                        Resultados da Calibração
                    </DialogTitle>
                    <DialogDescription>
                        Audit details for calibration performed on {format(new Date(record.calibratedAt), "PPp")} by {record.performedBy}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Left Column: Raw Data Points */}
                    <div className="border rounded-xl bg-slate-50/50 dark:bg-slate-900/20 p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Box className="h-4 w-4 text-slate-500" />
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Raw Data Points</h3>
                        </div>
                        
                        {points.length > 0 ? (
                            <div className="rounded-md border bg-white dark:bg-slate-950 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-slate-900">
                                        <TableRow>
                                            <TableHead>Reference Value</TableHead>
                                            <TableHead>Measured Raw</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {points.map((p, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                                                    {p.reference}
                                                </TableCell>
                                                <TableCell className="font-mono text-slate-600 dark:text-slate-400">
                                                    {p.raw.toFixed(4)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 flex items-center gap-2 p-4 border border-dashed rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                No raw points were recorded for this calibration.
                            </div>
                        )}
                    </div>

                    {/* Right Column: Resulting Coefficients */}
                    <div className="border rounded-xl bg-slate-50/50 dark:bg-slate-900/20 p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-slate-500" />
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Resulting Coefficients</h3>
                        </div>

                        {isSegmented ? (
                            <div className="rounded-md border bg-white dark:bg-slate-950 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-slate-900">
                                        <TableRow>
                                            <TableHead>Segment Condition</TableHead>
                                            <TableHead>Slope (m)</TableHead>
                                            <TableHead>Offset (b)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {segments.map((seg, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    {seg.rawBoundary !== null ? (
                                                        <Badge variant="outline" className="font-mono bg-slate-100 dark:bg-slate-800">
                                                            raw {seg.operator} {seg.rawBoundary.toFixed(2)}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="font-mono">
                                                            fallback / default
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{seg.m.toExponential(4)}</TableCell>
                                                <TableCell className="font-mono text-xs">{seg.b.toExponential(4)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : singleM !== undefined && singleB !== undefined ? (
                            <div className="rounded-md border bg-white dark:bg-slate-950 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-slate-900">
                                        <TableRow>
                                            <TableHead>Model</TableHead>
                                            <TableHead>Slope (m)</TableHead>
                                            <TableHead>Offset (b)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <Badge variant="outline">Linear / Global</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{Number(singleM).toExponential(4)}</TableCell>
                                            <TableCell className="font-mono text-xs">{Number(singleB).toExponential(4)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 flex items-center gap-2 p-4 border border-dashed rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                No mathematical coefficients found in config.
                            </div>
                        )}
                    </div>
                </div>

                {/* GLP Audit Addition: Muted Snapshot Metadata */}
                <div className="mt-8 border-t pt-4 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-slate-400 font-mono gap-4">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 shrink-0 rounded-full bg-emerald-500/50"></span>
                        <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-[300px]" title={record.id}>Record ID: {record.id}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 shrink-0">
                        <span>Algorithm: Piecewise Linear (v1.0)</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Edge Worker Version: v2.1.0 (Stable)</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
