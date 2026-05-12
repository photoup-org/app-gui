import { Truck, List, Clock, AlertCircle, Package, ExternalLink } from "lucide-react";
import { getMockTrackingStatus } from "@/lib/services/tracking";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { HardwareRegistrationDialog } from "./HardwareRegistrationDialog";

interface TrackingWidgetProps {
    trackingNumber: string | null;
}

/**
 * Async Server Component that fetches tracking status directly from the DAL.
 * Implements the premium design with history and registration dialogs.
 */
export async function TrackingWidget({ trackingNumber }: TrackingWidgetProps) {
    const cardBaseClasses = "bg-white dark:bg-slate-900 border border-border rounded-2xl p-5 flex flex-col gap-4 w-full max-w-md h-full";


    // 1. Empty State
    if (!trackingNumber) {
        return (
            <div className={cn(cardBaseClasses, "opacity-70 h-full justify-center items-center")}>
                <div className="flex flex-col items-center gap-4 ">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">A aguardar expedição</p>
                        <p className="text-slate-500 text-xs text-left">O seu pedido será enviado em breve</p>
                    </div>

                </div>
            </div>
        );
    }

    try {
        // 2. Fetch Data (Directly from DAL)
        const trackingData = await getMockTrackingStatus(trackingNumber);

        // 3. Success State (Modern UI Implementation)
        return (
            <div className={cardBaseClasses}>
                <div className="flex flex-col gap-4">
                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col items-start">
                            <span className=" font-bold text-slate-800 dark:text-slate-200">
                                A sua encomenda
                            </span>
                            <span className="text-sm text-slate-500">{trackingData.trackingNumber}</span>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Histórico de Envio</DialogTitle>
                                </DialogHeader>
                                <div className="py-4 text-slate-500 text-sm">
                                    Implementation pending...
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Main Status Block */}
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col text-right">
                            <span className="text-sm text-muted-foreground whitespace-nowrap"> {trackingData.updateDate}</span>
                            <span className="text-sm text-muted-foreground"> {trackingData.updateTime}</span>
                        </div>
                        <div className="flex flex-col text-left">
                            <p className="text-lg font-bold text-primary leading-tight">
                                {trackingData.statusTitle}
                            </p>
                            <p className="text-xs text-slate-500 leading-normal">
                                {trackingData.statusDescription}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <HardwareRegistrationDialog>
                    <Button className="w-full bg-primary hover:bg-primary/80 text-white font-bold rounded-xl h-11 transition-colors mt-auto">
                        O Meu Hardware Chegou
                    </Button>
                </HardwareRegistrationDialog>
            </div>
        );
    } catch (error) {
        // 4. Error State
        console.error("[TrackingWidget] Failed to load tracking state:", error);
        return (
            <div className={cn(cardBaseClasses, "border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10")}>
                <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        Não foi possível carregar o estado da encomenda.
                    </p>
                </div>
            </div>
        );
    }
}
