"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getExperimentTelemetryForExport } from "@/app/(HaaS)/projects/[projectId]/experiments/actions";
import { downloadExcel } from "@/lib/export-utils";
import { toast } from "sonner";

interface ExportDataButtonProps {
    experimentId: string;
}

export function ExportDataButton({ experimentId }: ExportDataButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const result = await getExperimentTelemetryForExport(experimentId);
            
            if (result.success && result.data && result.data.telemetry) {
                downloadExcel(result.data, result.experimentName || "experiencia");
                if (result.data.telemetry.length > 0) {
                    toast.success("Exportação concluída com sucesso.");
                } else {
                    toast.info("Atenção: A experiência foi exportada, mas não contém dados de telemetria.");
                }
            } else {
                toast.error(result.error || "Erro ao exportar dados.");
            }
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Ocorreu um erro durante a exportação.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button 
            variant="outline" 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2"
        >
            {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            Exportar para Excel
        </Button>
    );
}
