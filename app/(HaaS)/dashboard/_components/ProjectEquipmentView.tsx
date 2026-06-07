"use client";

import { useEffect, useState } from "react";
import { getProjectEquipmentAction } from "@/app/(HaaS)/projects/actions";
import { EquipmentTable } from "@/components/haas/equipment/EquipmentTable";
import { Loader2 } from "lucide-react";

export function ProjectEquipmentView({ projectId }: { projectId: string }) {
    const [devices, setDevices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchEquipment() {
            try {
                setIsLoading(true);
                const result = await getProjectEquipmentAction(projectId);
                if (mounted) {
                    if (result.success && result.data) {
                        setDevices(result.data);
                    } else {
                        setError(result.error || "Erro ao carregar equipamentos");
                    }
                }
            } catch (err) {
                if (mounted) {
                    setError("Erro ao carregar equipamentos");
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchEquipment();

        return () => {
            mounted = false;
        };
    }, [projectId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>A carregar equipamentos...</p>
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
            <EquipmentTable devices={devices} />
        </div>
    );
}
