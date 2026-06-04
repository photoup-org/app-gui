"use client";

import { useEffect, useState } from "react";
import { getProjectAlertsAction, getExperimentsByProjectIdAction } from "@/app/(HaaS)/projects/actions";
import { Loader2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function ProjectAlertsView({ projectId }: { projectId: string }) {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [experimentsList, setExperimentsList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [experimentFilter, setExperimentFilter] = useState<string>("ALL");
    const [severityFilter, setSeverityFilter] = useState<string>("ALL");

    useEffect(() => {
        let mounted = true;

        async function fetchAlerts() {
            try {
                setIsLoading(true);
                const [alertsResult, expsResult] = await Promise.all([
                    getProjectAlertsAction(projectId),
                    getExperimentsByProjectIdAction(projectId)
                ]);
                
                if (mounted) {
                    if (alertsResult.success && alertsResult.data) {
                        setAlerts(alertsResult.data);
                    } else {
                        setError(alertsResult.error || "Erro ao carregar alertas");
                    }
                    
                    if (expsResult.success && expsResult.data) {
                        setExperimentsList(expsResult.data);
                    }
                }
            } catch (err) {
                if (mounted) {
                    setError("Erro ao carregar alertas");
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchAlerts();

        return () => {
            mounted = false;
        };
    }, [projectId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>A carregar alertas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-6 text-red-500 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 rounded-lg">
                {error}
            </div>
        );
    }

    const uniqueExperiments = experimentsList.map(exp => ({ id: exp.id, name: exp.name }));

    // Apply filters
    const filteredAlerts = alerts.filter(alert => {
        const passExperiment = experimentFilter === "ALL" || alert.experiment?.id === experimentFilter;
        const passSeverity = severityFilter === "ALL" || alert.severity === severityFilter;
        return passExperiment && passSeverity;
    });

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'WARNING': return <AlertCircle className="w-4 h-4 text-amber-500" />;
            case 'INFO': return <Info className="w-4 h-4 text-blue-500" />;
            default: return <Info className="w-4 h-4 text-slate-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-PT');
    };

    return (
        <div className="animate-in fade-in duration-500 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col gap-1.5 w-full sm:w-1/2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtro de Experiência</label>
                    <Select value={experimentFilter} onValueChange={setExperimentFilter}>
                        <SelectTrigger className="bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Todas as Experiências" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todas as Experiências</SelectItem>
                            {uniqueExperiments.map(exp => (
                                <SelectItem key={exp.id} value={exp.id}>{exp.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-1.5 w-full sm:w-1/2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtro de Severidade</label>
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                        <SelectTrigger className="bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todas</SelectItem>
                            <SelectItem value="CRITICAL">Crítico</SelectItem>
                            <SelectItem value="WARNING">Aviso</SelectItem>
                            <SelectItem value="INFO">Informação</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead className="w-[15%]">Data/Hora</TableHead>
                            <TableHead className="w-[15%]">Severidade</TableHead>
                            <TableHead className="w-[20%]">Experiência</TableHead>
                            <TableHead className="w-[25%]">Título</TableHead>
                            <TableHead className="w-[25%]">Mensagem</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAlerts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                    Nenhum alerta encontrado para os filtros selecionados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAlerts.map(alert => (
                                <TableRow key={alert.id}>
                                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                        {formatDate(alert.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getSeverityIcon(alert.severity)}
                                            <span className="text-xs font-medium capitalize">
                                                {alert.severity.toLowerCase()}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {alert.experiment ? (
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {alert.experiment.name}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {alert.title}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                                        {alert.message || "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
