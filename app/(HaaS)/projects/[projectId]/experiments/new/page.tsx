import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import NewExperimentForm from './NewExperimentForm';
import { ArrowLeft, Beaker } from 'lucide-react';
import Link from 'next/link';

export default async function NewExperimentPage({
    params
}: {
    params: Promise<{ projectId: string }>
}) {
    const resolvedParams = await params;
    
    const project = await prisma.project.findUnique({
        where: { id: resolvedParams.projectId },
        include: {
            devices: {
                include: {
                    product: true,
                    experiments: {
                        where: { status: 'RUNNING' }
                    }
                }
            }
        }
    });

    if (!project) {
        notFound();
    }

    // Serialize devices to plain objects to avoid passing Decimal objects from Prisma
    const serializedDevices = project.devices.map(device => ({
        id: device.id,
        serialNumber: device.serialNumber,
        status: device.status,
        experiments: device.experiments.map(e => ({ id: e.id, status: e.status })),
        product: {
            name: device.product.name,
        }
    }));

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 w-full animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
                <Link href={`/projects/${resolvedParams.projectId}`} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 w-fit transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Projeto
                </Link>
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl">
                        <Beaker className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Nova Experiência
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Configure os detalhes e aloque os equipamentos necessários.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <NewExperimentForm projectId={project.id} devices={serializedDevices} />
            </div>
        </div>
    );
}
