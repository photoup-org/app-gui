import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, Building, Server, Beaker, Radio } from 'lucide-react';
import ProjectActions from './ProjectActions';
import Link from 'next/link';
import { DeleteExperimentButton } from '@/components/haas/experiments/DeleteExperimentButton';
import { ExperimentTable } from '@/components/haas/experiments/ExperimentTable';
export default async function ProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const resolvedParams = await params;
    const project = await prisma.project.findUnique({
        where: { id: resolvedParams.projectId },
        include: {
            department: true,
            devices: {
                include: {
                    product: {
                        select: {
                            id: true,
                            sku: true,
                            name: true,
                            subtitle: true,
                            type: true
                        }
                    }
                }
            },
            experiments: {
                orderBy: {
                    startDate: 'desc'
                },
                include: {
                    devices: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
            members: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!project) {
        notFound();
    }

    const isArchived = project.status === "ARCHIVED";

    return (
        <div className="max-w-7xl mx-auto p-6 flex flex-col gap-8 w-full animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {project.name}
                    </h1>
                    <Badge
                        variant={isArchived ? "secondary" : "default"}
                        className={`px-2.5 py-0.5 text-xs font-semibold ${isArchived
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}
                    >
                        {isArchived ? 'Archived' : 'Active'}
                    </Badge>
                </div>
                <div className="flex items-center">
                    <ProjectActions projectId={project.id} project={project} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metadata Card */}
                <Card className="col-span-1 border-slate-200 dark:border-slate-800 ">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Server className="h-5 w-5 text-indigo-500" />
                            Detalhes do Projeto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Descrição</p>
                            <p className="text-sm text-slate-900 dark:text-slate-100">
                                {project.description || "Nenhuma descrição fornecida."}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Building className="h-4 w-4 text-slate-400" />
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Departamento</span>
                                <span className="text-sm font-medium">{project.department.name}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Criado em</span>
                                <span className="text-sm font-medium">
                                    {new Date(project.createdAt).toLocaleDateString('pt-PT')}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column (Sensors & Experiments) */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-6">

                    {/* Allocated Sensors Card */}
                    <Card className="border-slate-200 dark:border-slate-800 ">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Radio className="h-5 w-5 text-emerald-500" />
                                    Equipamentos Alocados
                                </div>
                                <Badge variant="outline" className="text-xs rounded-full px-2">
                                    {project.devices.length}
                                </Badge>
                            </CardTitle>
                            <CardDescription>Sensores e gateways atualmente reservados para este projeto.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {project.devices.length === 0 ? (
                                <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400 border border-dashed rounded-lg">
                                    Nenhum equipamento alocado.
                                </div>
                            ) : (
                                <div className="rounded-md border dark:border-slate-800 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50 dark:bg-slate-900">
                                            <TableRow>
                                                <TableHead>Serial Number</TableHead>
                                                <TableHead>Tipo / Produto</TableHead>
                                                <TableHead>Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {project.devices.map((device) => (
                                                <TableRow key={device.id}>
                                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                                        {device.serialNumber}
                                                    </TableCell>
                                                    <TableCell className="text-slate-500 dark:text-slate-400">
                                                        {device.product.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 capitalize text-xs">
                                                            {device.status.toLowerCase()}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Experiments Card */}
                    <Card className="border-slate-200 dark:border-slate-800 ">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Beaker className="h-5 w-5 text-indigo-500" />
                                    Histórico de Experiências
                                </div>
                                <Badge variant="outline" className="text-xs rounded-full px-2">
                                    {project.experiments.length}
                                </Badge>
                            </CardTitle>
                            <CardDescription>Registo de todas as experiências realizadas ou em curso.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {project.experiments.length === 0 ? (
                                <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400 border border-dashed rounded-lg">
                                    Nenhuma experiência iniciada.
                                </div>
                            ) : (
                                <ExperimentTable experiments={project.experiments} projectId={project.id} />
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}