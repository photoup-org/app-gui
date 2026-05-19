"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Filter,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react"
import { getDeviceUI } from "@/lib/hardware-map"
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from "@/components/ui/scroll-area"

interface MappedCalibrationDevice {
    id: string;
    serialNumber: string;
    status: string;
    productName: string;
    productSku: string;
    productSubtitle: string;
    recentCalibration: {
        id: string;
        deviceId: string;
        calibratedAt: string | Date;
        validUntil: string | Date;
        performedBy: string;
        notes?: string | null;
    } | null;
}

interface CalibrationSummaryProps {
    data: {
        data: MappedCalibrationDevice[];
        metadata: {
            total: number;
            page: number;
            totalPages: number;
        };
    };
}

const CalibrationSummary = ({ data }: CalibrationSummaryProps) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentPage = data.metadata?.page || 1
    const totalPages = data.metadata?.totalPages || 1
    const devices = data.data || []

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        const params = new URLSearchParams(searchParams.toString())
        params.set('calibrationPage', newPage.toString())
        router.push(`?${params.toString()}`, { scroll: false })
    }

    const formatDate = (dateValue: string | Date | null) => {
        if (!dateValue) return "-"
        const date = new Date(dateValue)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }

    return (
        <Card className="flex flex-col h-full w-full min-w-0 border border-slate-100 dark:border-slate-800 mb-0 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between pb-3 px-6 space-y-0 shrink-0">
                <CardTitle className="font-bold text-slate-900 dark:text-white">
                    Calibração
                </CardTitle>
                <div className="flex items-center gap-1 text-slate-400">
                    <Button variant="ghost" size="icon" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors" aria-label="Filtrar">
                        <Filter className="w-4.5 h-4.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors" aria-label="Abrir calibrações">
                        <ExternalLink className="w-4.5 h-4.5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden px-6 pb-2 min-h-0">
                <ScrollArea className="h-full w-full pr-2">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                <TableHead className="h-9 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0 w-1/4">Sensor ID</TableHead>
                                <TableHead className="h-9 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-1/4">Tipo de Sensor</TableHead>
                                <TableHead className="h-9 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-[30%]">Última Calibração</TableHead>
                                <TableHead className="h-9 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pr-0 w-[20%]">Validade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {devices.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={4} className="h-28 text-center text-xs text-slate-400 pl-0 pr-0">
                                        Nenhum sensor registado para calibração.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                devices.map((device) => {
                                    const { icon: Icon, textColor } = getDeviceUI(device.productName)
                                    return (
                                        <TableRow key={device.id} className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                            <TableCell className="py-2.5 pl-0 text-xs font-semibold text-slate-500 dark:text-slate-400 w-1/4">
                                                ...{device.serialNumber.slice(-12)}
                                            </TableCell>
                                            <TableCell className="py-2.5 w-1/4">
                                                <div className="flex items-center gap-1.5">
                                                    <Icon className={`w-3.5 h-3.5 ${textColor}`} />
                                                    <span className={`text-xs font-bold ${textColor}`}>
                                                        {device.productName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2.5 text-xs text-slate-500 dark:text-slate-400 w-[30%]">
                                                {device.recentCalibration ? (
                                                    <span>
                                                        {formatDate(device.recentCalibration.calibratedAt)} por {device.recentCalibration.performedBy}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-500">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-2.5 text-xs text-slate-500 dark:text-slate-400 pr-0 w-[20%]">
                                                {device.recentCalibration ? (
                                                    <span>
                                                        {formatDate(device.recentCalibration.validUntil)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-500">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>

            {/* Footer and Pagination Panel */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 pb-5 px-6 shrink-0 mt-auto">
                {/* Placeholder on the left to balance the layout */}
                <div className="w-24 shrink-0" />

                {/* Pagination in the center */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-1 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        aria-label="Primeira página"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold px-2.5 tabular-nums">
                        {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        aria-label="Próxima página"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-1 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        aria-label="Última página"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Action Button on the right */}
                <Button
                    variant="ghost"
                    className='text-primary'
                >
                    Calibrar Sensor
                </Button>
            </div>
        </Card>
    )
}

export default CalibrationSummary