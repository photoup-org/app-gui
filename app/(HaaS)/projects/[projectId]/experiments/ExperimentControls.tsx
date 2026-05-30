"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Loader2 } from "lucide-react";
import { updateExperimentLifecycle } from "./actions";
import { ExperimentStatus } from "@prisma/client";
import { toast } from "sonner";

interface ExperimentControlsProps {
    experimentId: string;
    projectId: string;
    currentStatus: ExperimentStatus;
}

export default function ExperimentControls({ experimentId, projectId, currentStatus }: ExperimentControlsProps) {
    const [isPending, startTransition] = useTransition();

    if (currentStatus === "COMPLETED") {
        return null;
    }

    const handleTransition = (newStatus: ExperimentStatus) => {
        startTransition(async () => {
            const res = await updateExperimentLifecycle(projectId, experimentId, newStatus);
            if (res.success) {
                toast.success(`Experiência ${newStatus === 'RUNNING' ? 'Iniciada' : newStatus === 'PAUSED' ? 'Pausada' : 'Terminada'}`);
            } else {
                toast.error(res.error || "Erro ao atualizar estado.");
            }
        });
    };

    return (
        <div className="flex items-center gap-2 mt-3 md:mt-0">
            {currentStatus === "PLANNED" && (
                <Button 
                    onClick={() => handleTransition("RUNNING")} 
                    disabled={isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[170px]"
                >
                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
                    Iniciar Experiência
                </Button>
            )}

            {currentStatus === "RUNNING" && (
                <>
                    <Button 
                        variant="secondary"
                        onClick={() => handleTransition("PAUSED")} 
                        disabled={isPending}
                        className="min-w-[120px]"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Pause className="w-4 h-4 mr-2 fill-current" />}
                        Pausar
                    </Button>
                    <Button 
                        variant="destructive"
                        onClick={() => handleTransition("COMPLETED")} 
                        disabled={isPending}
                        className="min-w-[120px]"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Square className="w-4 h-4 mr-2 fill-current" />}
                        Terminar
                    </Button>
                </>
            )}

            {currentStatus === "PAUSED" && (
                <>
                    <Button 
                        onClick={() => handleTransition("RUNNING")} 
                        disabled={isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
                        Retomar
                    </Button>
                    <Button 
                        variant="destructive"
                        onClick={() => handleTransition("COMPLETED")} 
                        disabled={isPending}
                        className="min-w-[120px]"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Square className="w-4 h-4 mr-2 fill-current" />}
                        Terminar
                    </Button>
                </>
            )}
        </div>
    );
}
