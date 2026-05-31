"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { DeleteExperimentButton } from "@/components/haas/experiments/DeleteExperimentButton";
import { ChevronDown, ChevronRight, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExperimentTableProps {
    experiments: any[];
    projectId: string;
}

export function ExperimentTable({ experiments, projectId }: ExperimentTableProps) {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const toggleRow = (id: string) => {
        setExpandedRow(prev => prev === id ? null : id);
    };

    if (experiments.length === 0) {
        return (
            <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400 border border-dashed rounded-lg">
                Nenhuma experiência iniciada.
            </div>
        );
    }

    return (
        <div className="rounded-md border dark:border-slate-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Fim</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {experiments.map((exp) => (
                        <React.Fragment key={exp.id}>
                            <TableRow
                                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                onClick={() => toggleRow(exp.id)}
                            >
                                <TableCell className="pl-4">
                                    {expandedRow === exp.id ? (
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-slate-400" />
                                    )}
                                </TableCell>
                                <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                    {exp.name}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={
                                            exp.status === 'RUNNING'
                                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                                                : exp.status === 'COMPLETED'
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                        }
                                    >
                                        {exp.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                                    {new Date(exp.startDate).toLocaleDateString('pt-PT')}
                                </TableCell>
                                <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString('pt-PT') : '-'}
                                </TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/projects/${projectId}/experiments/${exp.id}`}>
                                                Ver Detalhes
                                            </Link>
                                        </Button>
                                        <DeleteExperimentButton
                                            experimentId={exp.id}
                                            projectId={projectId}
                                            disabled={['RUNNING', 'PAUSED'].includes(exp.status)}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                            {expandedRow === exp.id && (
                                <TableRow className="bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 border-b">
                                    <TableCell colSpan={6} className="p-4">
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Equipamentos Alocados</h4>
                                                {exp.devices && exp.devices.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {exp.devices.map((device: any) => (
                                                            <Badge key={device.id} variant="outline" className="flex items-center gap-1.5 py-1 px-2.5">
                                                                <Cpu className="w-3.5 h-3.5 text-teal-500" />
                                                                <span className="font-mono text-xs">{device.serialNumber || device.id.split('-')[0]}</span>
                                                                {device.product?.name && (
                                                                    <span className="text-xs text-slate-500">({device.product.name})</span>
                                                                )}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-500 italic">Detalhes dos equipamentos não carregados ou não existem equipamentos associados.</p>
                                                )}
                                            </div>
                                            {exp.settings && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Configurações Avançadas</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <span className="block text-xs text-slate-500">Frequência de Gravação</span>
                                                            <span className="font-medium text-slate-900 dark:text-slate-100">{exp.settings.storageFrequency || 60}s</span>
                                                        </div>
                                                        <div>
                                                            <span className="block text-xs text-slate-500">Estratégia de Agregação</span>
                                                            <span className="font-medium text-slate-900 dark:text-slate-100">{exp.settings.aggregationStrategy || 'Média'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
