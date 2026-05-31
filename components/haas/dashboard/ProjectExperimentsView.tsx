"use client";

import { useEffect, useState } from "react";
import { getExperimentsByProjectIdAction } from "@/app/(HaaS)/projects/actions";
import { ExperimentTable } from "@/components/haas/experiments/ExperimentTable";
import { Loader2 } from "lucide-react";

export function ProjectExperimentsView({ projectId }: { projectId: string }) {
    const [experiments, setExperiments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchExperiments() {
            try {
                setIsLoading(true);
                const result = await getExperimentsByProjectIdAction(projectId);
                if (mounted) {
                    if (result.success && result.data) {
                        setExperiments(result.data);
                    } else {
                        setError(result.error || "Erro ao carregar experiências");
                    }
                }
            } catch (err) {
                if (mounted) {
                    setError("Erro ao carregar experiências");
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchExperiments();

        return () => {
            mounted = false;
        };
    }, [projectId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>A carregar experiências...</p>
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

    return (
        <div className="animate-in fade-in duration-500">
            <ExperimentTable experiments={experiments} projectId={projectId} />
        </div>
    );
}
