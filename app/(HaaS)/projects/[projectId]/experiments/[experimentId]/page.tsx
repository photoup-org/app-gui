import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Beaker, CalendarDays, ArrowLeft, Info, Settings } from 'lucide-react';
import Link from 'next/link';
import DynamicSensorChart from '@/components/haas/experiments/DynamicSensorChart';
import ExperimentControls from '../ExperimentControls';
import ExperimentTimer from '../ExperimentTimer';

export default async function ExperimentDetailsPage({
    params
}: {
    params: Promise<{ projectId: string, experimentId: string }>
}) {
    const resolvedParams = await params;
    const { projectId, experimentId } = resolvedParams;

    const experiment = await prisma.experiment.findUnique({
        where: { id: experimentId, projectId },
        include: {
            project: true,
            devices: {
                include: {
                    product: true,
                    readings: {
                        orderBy: { timestamp: 'desc' },
                        take: 1000
                    }
                }
            }
        }
    });

    if (!experiment) {
        notFound();
    }

    // Data Transformation
    const devicesWithTelemetry = experiment.devices.map((device) => {
        // Reverse readings to be chronological left-to-right
        const reversedReadings = [...device.readings].reverse();

        // Extract schema safely from device config
        const configObj = (device.config && typeof device.config === 'object') ? device.config : {};
        const schema = Array.isArray((configObj as any).schema) ? (configObj as any).schema : [];

        return {
            ...device,
            telemetry: reversedReadings,
            schema
        };
    });

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 w-full animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-4">
                    <Link href={`/projects/${projectId}`} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 w-fit transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Projeto / {experiment.project.name}
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            <Beaker className="h-8 w-8 text-indigo-500" />
                            {experiment.name}
                        </h1>
                        <Badge
                            className={`px-2.5 py-0.5 text-xs font-semibold ${
                                experiment.status === 'RUNNING'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : experiment.status === 'COMPLETED'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                        >
                            {experiment.status}
                        </Badge>
                        <ExperimentTimer 
                            status={experiment.status}
                            accumulatedSeconds={experiment.accumulatedSeconds}
                            lastRunAt={experiment.lastRunAt}
                            endDate={experiment.endDate}
                        />
                    </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 md:mt-10">
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            Início: {new Date(experiment.startDate).toLocaleDateString('pt-PT')}
                        </div>
                        {experiment.endDate && (
                            <div className="flex items-center gap-1.5 border-l border-slate-300 dark:border-slate-700 pl-4">
                                <CalendarDays className="h-4 w-4" />
                                Fim: {new Date(experiment.endDate).toLocaleDateString('pt-PT')}
                            </div>
                        )}
                    </div>
                    <ExperimentControls 
                        experimentId={experiment.id} 
                        projectId={projectId} 
                        currentStatus={experiment.status}
                        devices={experiment.devices} 
                    />
                </div>
            </div>

            {/* Metadata & Settings (Optional) */}
            {(experiment.project.description || experiment.settings) && (
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Settings className="w-4 h-4 text-slate-500" />
                            Detalhes & Configurações
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 dark:text-slate-400 flex flex-col gap-2">
                        {experiment.project.description && (
                            <p>{experiment.project.description}</p>
                        )}
                        {experiment.settings && typeof experiment.settings === 'object' && Object.keys(experiment.settings).length > 0 && (
                            <pre className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-md text-xs overflow-x-auto">
                                {JSON.stringify(experiment.settings, null, 2)}
                            </pre>
                        )}
                    </CardContent>
                </Card>
            )}

            <Separator className="my-6" />

            {/* Dashboard / Telemetry Section */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Painel de Telemetria
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
                        <Info className="h-4 w-4" />
                        Mostrando as últimas 1000 leituras
                    </div>
                </div>

                {devicesWithTelemetry.length === 0 ? (
                    <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400 border border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                        Nenhum dispositivo alocado a esta experiência.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {devicesWithTelemetry.map(device => (
                            <DynamicSensorChart
                                key={device.id}
                                deviceId={device.id}
                                telemetryData={device.telemetry}
                                deviceSchema={device.schema}
                                deviceName={`${device.product.name} (${device.serialNumber.slice(-4)})`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
