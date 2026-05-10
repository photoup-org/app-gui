"use client";

import { useState, useTransition } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerDeviceAction } from "@/actions/devices";
import { Loader2, Router, ScanLine, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface HardwareRegistrationDialogProps {
    children: React.ReactNode;
}

/**
 * Updated Hardware Registration Dialog with entrance/exit animations.
 */
export function HardwareRegistrationDialog({ children }: HardwareRegistrationDialogProps) {
    const [open, setOpen] = useState(false);
    const [serialNumber, setSerialNumber] = useState("");
    const [isPending, startTransition] = useTransition();
    const [isScanning, setIsScanning] = useState(false);

    const handleRegister = (sn: string) => {
        if (!sn || sn.trim() === "") {
            toast.error("Por favor, insira um número de série.");
            return;
        }

        startTransition(async () => {
            try {
                const result = await registerDeviceAction(sn.trim());
                if (result.success) {
                    toast.success("Hardware registado com sucesso!");
                    setOpen(false);
                    setSerialNumber("");
                    setIsScanning(false);
                } else {
                    toast.error(result.error || "Ocorreu um erro ao registar o equipamento.");
                }
            } catch (error) {
                console.error("Registration error:", error);
                toast.error("Erro de ligação ao servidor.");
            }
        });
    };

    const handleQrScan = (detectedCodes: any[]) => {
        if (detectedCodes.length === 0) return;

        const scannedText = detectedCodes[0].rawValue;
        let extractedSn = scannedText;

        try {
            const url = new URL(scannedText);
            if (url.searchParams.has("sn")) {
                extractedSn = url.searchParams.get("sn") as string;
            }
        } catch (e) {
            // Not a URL, use raw text
        }

        handleRegister(extractedSn);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                setIsScanning(false);
                setSerialNumber("");
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] p-8 overflow-hidden rounded-[32px] border-none shadow-2xl bg-white flex flex-col items-center text-center">
                {/* Header Section */}
                <div className="w-full flex flex-col items-center gap-6 mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-[#2AC5C1] flex items-center justify-center shadow-lg shadow-[#2AC5C1]/20">
                        <Router className="text-white h-8 w-8" />
                    </div>

                    <div className="space-y-2">
                        <DialogTitle className="text-[28px] font-bold text-slate-900 leading-tight">
                            Registe o seu Gateway
                        </DialogTitle>
                        <p className="text-slate-400 text-[15px] max-w-[280px] mx-auto leading-relaxed">
                            Registe o seu Gateway para começar a adquirir os seus dados
                        </p>
                    </div>
                </div>

                {/* QR Scan Area */}
                <div className="w-full mb-8 min-h-[160px] flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        {!isScanning ? (
                            <motion.div
                                key="scan-trigger"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col items-center"
                            >
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsScanning(true)}
                                    disabled={isPending}
                                    className="h-20 w-20 bg-blue-50 hover:bg-blue-100 rounded-3xl flex flex-col items-center justify-center gap-2 group transition-all"
                                >
                                    <ScanLine className="h-32 w-h-32 scale-200 text-blue-500 group-hover:scale-250 transition-transform" />
                                </Button>
                                <p className="text-sm font-semibold text-slate-900 mt-4">
                                    Faça o scan do código QR no seu dispositivo
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="scanner"
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                                className="w-full aspect-square max-w-[300px] rounded-3xl overflow-hidden relative border-4 border-[#2AC5C1]/20"
                            >
                                <Scanner
                                    onScan={handleQrScan}
                                    allowMultiple={false}
                                    scanDelay={2000}
                                    components={{
                                        torch: false,
                                        onOff: false
                                    }}
                                />
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    onClick={() => setIsScanning(false)}
                                    className="absolute top-3 right-3 bg-white/90 backdrop-blur shadow-sm hover:bg-white rounded-full z-20 h-8 w-8"
                                >
                                    <X size={16} className="text-slate-600" />
                                </Button>

                                {isPending && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                                        <Loader2 className="h-8 w-8 animate-spin text-[#2AC5C1]" />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Divider */}
                <div className="w-full flex items-center gap-4 mb-8">
                    <div className="h-[1px] flex-1 bg-slate-100" />
                    <span className="text-[13px] text-slate-400 font-medium whitespace-nowrap">
                        Ou adicione manualmente
                    </span>
                    <div className="h-[1px] flex-1 bg-slate-100" />
                </div>

                {/* Manual Input Section */}
                <div className="w-full flex gap-3">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Número de Série"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                            disabled={isPending}
                            className="h-14 bg-white border-slate-200 rounded-2xl px-5 text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#2AC5C1]/20 focus:border-[#2AC5C1] transition-all"
                        />
                    </div>
                    <Button
                        onClick={() => handleRegister(serialNumber)}
                        disabled={isPending || !serialNumber}
                        className="h-14 w-14 bg-[#2AC5C1] hover:bg-[#23B1AE] text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-[#2AC5C1]/20 active:scale-95 flex-shrink-0"
                    >
                        {isPending ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <Send className="h-6 w-6" />
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
