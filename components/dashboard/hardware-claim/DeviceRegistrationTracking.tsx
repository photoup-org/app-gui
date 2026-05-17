import { Server, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DeviceTypeCardProps {
    title: string;
    totalQuantity: number;
    claimedQuantity: number;
    iconType: "GATEWAY" | "SENSOR";
    onClaim: string;
}

import { HardwareProgress } from "@/lib/data/hardware";

interface DeviceRegistrationTrackingProps {
    sensorList: HardwareProgress['sensors'];
}

const DeviceRegistrationTracking = ({ sensorList }: DeviceRegistrationTrackingProps) => {
    return (
        <div className="flex flex-col p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow gap-3">

        </div>
    );
}

export default DeviceRegistrationTracking;


export function DeviceTypeCard({ title, totalQuantity, claimedQuantity, iconType, onClaim }: DeviceTypeCardProps) {
    const Icon = iconType === "GATEWAY" ? Server : Activity;
    const iconColor = iconType === "GATEWAY" ? "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50" : "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50";
    const progressValue = totalQuantity > 0 ? (claimedQuantity / totalQuantity) * 100 : 0;
    const isComplete = claimedQuantity === totalQuantity;

    return (
        <div className="flex flex-col p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-md ${iconColor}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{totalQuantity}x {title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{claimedQuantity} de {totalQuantity} Registados</p>
                    </div>
                </div>
                {!isComplete && (
                    <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800">
                        <Link href={onClaim}>
                            Registar
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </Button>
                )}
            </div>
            <Progress value={progressValue} className="h-1.5" />
        </div>
    );
}
