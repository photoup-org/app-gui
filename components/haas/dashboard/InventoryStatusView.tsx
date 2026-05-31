"use client";

import { useEffect, useState } from "react";
import { getDevicesByStatusAction } from "@/app/(HaaS)/equipment/actions";
import { EquipmentTable } from "@/components/haas/equipment/EquipmentTable";
import { Loader2 } from "lucide-react";

export function InventoryStatusView({ status }: { status: string }) {
    const [devices, setDevices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchEquipment() {
            try {
                setIsLoading(true);
                const result = await getDevicesByStatusAction(status);
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

        if (status) {
            fetchEquipment();
        }

        return () => {
            mounted = false;
        };
    }, [status]);

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

    if (devices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground">Nenhum equipamento neste estado.</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 max-h-[60vh] overflow-y-auto pr-2">
            <EquipmentTable devices={devices} />
        </div>
    );
}
