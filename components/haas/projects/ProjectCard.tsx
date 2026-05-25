import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Beaker, Radio } from 'lucide-react';

interface ProjectCardProps {
    project: {
        id: string;
        name: string;
        description: string | null;
        status: "ACTIVE" | "ARCHIVED";
        _count: {
            experiments: number;
            devices: number;
        };
    };
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const isArchived = project.status === "ARCHIVED";

    return (
        <Link href={`/projects/${project.id}`} className="block h-full">
            <Card className="h-full flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4 space-y-0">
                    <CardTitle className="text-xl font-semibold leading-tight line-clamp-2">
                        {project.name}
                    </CardTitle>
                    <Badge
                        variant={isArchived ? "secondary" : "default"}
                        className={`shrink-0 ${
                            isArchived 
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' 
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}
                    >
                        {isArchived ? 'Archived' : 'Active'}
                    </Badge>
                </CardHeader>
                <CardContent className="flex-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                        {project.description || "Nenhuma descrição fornecida."}
                    </p>
                </CardContent>
                <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5" title={`${project._count.experiments} Experiências`}>
                            <Beaker className="w-4 h-4 text-indigo-500" />
                            <span className="font-medium">{project._count.experiments}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title={`${project._count.devices} Sensores`}>
                            <Radio className="w-4 h-4 text-emerald-500" />
                            <span className="font-medium">{project._count.devices}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
