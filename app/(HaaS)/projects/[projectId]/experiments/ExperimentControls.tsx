"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Loader2 } from "lucide-react";
import { updateExperimentLifecycle } from "./actions";
import { ExperimentStatus } from "@prisma/client";
import { toast } from "sonner";
import { useMqttStore } from "@/hooks/useMqttStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ExperimentControlsProps {
    experimentId: string;
    projectId: string;
    currentStatus: ExperimentStatus;
    devices: { id: string; status: string; product: { name: string } }[];
}

export default function ExperimentControls({ experimentId, projectId, currentStatus, devices }: ExperimentControlsProps) {
    const [isPending, startTransition] = useTransition();
    const liveDevices = useMqttStore((state) => state.liveDevices);

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

    const offlineDevices = (devices || []).filter(d => {
        if (d.status !== 'ACTIVE') return true;
        const mqttStatus = liveDevices[d.id]?.status;
        return mqttStatus !== 'online' && mqttStatus !== 'busy';
    });
    const isReadyToStart = offlineDevices.length === 0;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mt-3 md:mt-0 justify-end">
                {currentStatus === "PLANNED" && (
                    <Button 
                        onClick={() => handleTransition("RUNNING")} 
                        disabled={isPending || !isReadyToStart}
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
                        disabled={isPending || !isReadyToStart}
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
            {currentStatus === "PLANNED" && !isReadyToStart && offlineDevices.length > 0 && (
                <Alert variant="destructive" className="py-2 mt-2 w-fit ml-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        A aguardar dispositivos: <strong>{offlineDevices[0].product.name}</strong> está offline.
                    </AlertDescription>
                </Alert>
            )}
            {currentStatus === "PAUSED" && !isReadyToStart && offlineDevices.length > 0 && (
                <Alert variant="destructive" className="py-2 mt-2 w-fit ml-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        A aguardar dispositivos: <strong>{offlineDevices[0].product.name}</strong> está offline.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
