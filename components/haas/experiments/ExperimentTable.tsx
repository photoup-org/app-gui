"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DeleteExperimentButton } from "@/components/haas/experiments/DeleteExperimentButton";
import { Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

interface ExperimentTableProps {
    experiments: any[];
    projectId: string;
}

export function ExperimentTable({ experiments, projectId }: ExperimentTableProps) {
    const columns: ColumnDef<any>[] = [
        {
            header: "Nome",
            cell: (exp) => <span className="font-medium text-slate-900 dark:text-slate-100">{exp.name}</span>,
        },
        {
            header: "Estado",
            cell: (exp) => (
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
            ),
        },
        {
            header: "Início",
            className: "text-slate-500 dark:text-slate-400 text-sm",
            cell: (exp) => new Date(exp.startDate).toLocaleDateString('pt-PT'),
        },
        {
            header: "Fim",
            className: "text-slate-500 dark:text-slate-400 text-sm",
            cell: (exp) => exp.endDate ? new Date(exp.endDate).toLocaleDateString('pt-PT') : '-',
        },
        {
            header: "Ações",
            headerClassName: "text-right",
            className: "text-right",
            cell: (exp) => (
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
            ),
        }
    ];

    const renderExpandedContent = (exp: any) => (
        <div className="space-y-4">
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
    );

    return (
        <DataTable
            data={experiments}
            columns={columns}
            keyExtractor={(exp) => exp.id}
            expandableContent={renderExpandedContent}
            emptyMessage="Nenhuma experiência iniciada."
        />
    );
}
