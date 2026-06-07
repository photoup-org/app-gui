"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMqttStore } from "@/hooks/useMqttStore";
import { calibrateDeviceAction } from "@/app/(HaaS)/equipment/actions";
import { Activity } from "lucide-react";

interface CalibrationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    deviceId: string;
    departmentId: string;
    deviceName: string;
    config: { 
        points?: 1 | 2; 
        intervalDays: number;
        calibration?: {
            minPoints: number;
            maxPoints: number;
            defaultReferences: number[];
        };
    };
    metricKey: string; // e.g., 'ph'
    metricLabel: string; // e.g., 'pH'
}

export function CalibrationWizard({
    isOpen,
    onClose,
    deviceId,
    departmentId,
    deviceName,
    config,
    metricKey,
    metricLabel,
}: CalibrationWizardProps) {
    const { isConnected, subscribe } = useMqttStore();
    const [step, setStep] = useState(1);
    const [points, setPoints] = useState<{ raw: number; reference: number }[]>([]);
    const [currentReference, setCurrentReference] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [liveRawValue, setLiveRawValue] = useState<number | undefined>();

    // Subscribe specifically to the new /raw topic for this device to see the true physical state
    useEffect(() => {
        if (isOpen && departmentId && deviceId) {
            const topic = `ui/live/department/${departmentId}/device/${deviceId}/raw`;
            const unsubscribe = subscribe(topic, (payload) => {
                if (payload.metric === metricKey) {
                    setLiveRawValue(payload.value);
                }
            });
            return () => unsubscribe();
        }
    }, [isOpen, departmentId, deviceId, metricKey, subscribe]);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setPoints([]);
            setCurrentReference(config.calibration ? config.calibration.defaultReferences[0].toFixed(2) : "");
        }
    }, [isOpen, config]);

    const maxPoints = config.calibration?.maxPoints ?? config.points ?? 2;
    const minPoints = config.calibration?.minPoints ?? config.points ?? 2;

    const handleCapture = () => {
        const refValue = parseFloat(currentReference);
        if (isNaN(refValue)) {
            toast.error("Por favor, introduza um valor de referência válido.");
            return;
        }
        if (liveRawValue === undefined) {
            toast.error("A aguardar leitura do sensor...");
            return;
        }

        const newPoints = [...points, { raw: liveRawValue, reference: refValue }];
        setPoints(newPoints);

        if (newPoints.length >= maxPoints) {
            submitCalibration(newPoints);
        } else {
            setStep(step + 1);
            if (config.calibration && step < config.calibration.defaultReferences.length) {
                setCurrentReference(config.calibration.defaultReferences[step].toFixed(2));
            } else {
                setCurrentReference("");
            }
        }
    };

    const submitCalibration = async (finalPoints: { raw: number; reference: number }[]) => {
        setIsSubmitting(true);
        try {
            const result = await calibrateDeviceAction(deviceId, metricKey, finalPoints);
            if (result.success) {
                toast.success(`Calibração aplicada com sucesso!`);
                onClose();
            } else {
                toast.error(result.error || "Erro ao aplicar calibração.");
                setPoints([]);
                setStep(1);
            }
        } catch (error) {
            toast.error("Erro interno ao comunicar com o servidor.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Calibrar {deviceName}</DialogTitle>
                    <DialogDescription>
                        Calibração de {minPoints}{maxPoints !== minPoints ? ` a ${maxPoints}` : ''} ponto(s) para {metricLabel}.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                        <Activity className="h-8 w-8 text-indigo-500 mb-2 animate-pulse" />
                        <span className="text-sm text-slate-500 mb-1">Leitura Atual (RAW / Sem Calibração)</span>
                        <span className="text-4xl font-mono font-semibold text-slate-900 dark:text-slate-100">
                            {liveRawValue !== undefined ? Number(liveRawValue).toFixed(2) : "--.--"}
                        </span>
                        {!isConnected && (
                            <span className="text-xs text-amber-500 mt-2">A aguardar ligação MQTT...</span>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium text-slate-800 dark:text-slate-200">
                            Passo {step} de {maxPoints}
                        </h4>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Valor de Referência (Solução Padrão)
                            </label>
                            <input
                                type="number"
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950"
                                placeholder={`Ex: ${step === 1 ? '7.00' : '4.00'}`}
                                value={currentReference}
                                onChange={(e) => setCurrentReference(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    {points.length >= minPoints && points.length < maxPoints && (
                        <Button 
                            variant="default" 
                            className="bg-green-600 hover:bg-green-700" 
                            onClick={() => submitCalibration(points)} 
                            disabled={isSubmitting}
                        >
                            Finalizar Calibração ({points.length} pontos)
                        </Button>
                    )}
                    <Button 
                        onClick={handleCapture} 
                        disabled={isSubmitting || currentReference === ""}
                        variant={points.length >= minPoints ? "outline" : "default"}
                    >
                        {isSubmitting ? "A Guardar..." : (step === maxPoints ? "Capturar e Finalizar" : (points.length >= minPoints ? "Adicionar 3º Ponto" : "Capturar Ponto e Continuar"))}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
