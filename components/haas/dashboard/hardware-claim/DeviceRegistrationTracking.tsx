import { ArrowRight, Download, QrCode, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HardwareProgress } from "@/lib/data/hardware";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeviceUI } from "@/lib/hardware-map";
import { HardwareRegistrationDialog } from "../HardwareRegistrationDialog";

export interface IDeviceTypeCardProps {
    title: string;
    totalQuantity: number;
    claimedQuantity: number;
    onClaim: string;
}


interface DeviceRegistrationTrackingProps {
    sensorList: HardwareProgress['sensors'];
}

const DeviceRegistrationTracking = ({ sensorList }: DeviceRegistrationTrackingProps) => {
    console.log(sensorList)
    return <Card className="flex flex-col h-full w-sm">
        <CardHeader className="items-center pb-0">
            <CardTitle>Visão Geral do Pedido</CardTitle>
            <CardAction className="items-center flex gap-2">
                <Button title="Download da sua Fatura" variant="ghost" size="icon-sm">
                    <Download />
                </Button>
                <Button variant="ghost" size="icon-sm">
                    <SquareArrowOutUpRight />
                </Button>
            </CardAction>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex flex-col gap-5 pt-4">
            {sensorList.map((sensor, index) => (
                <DeviceTypeCard
                    key={index}
                    title={sensor.type}
                    totalQuantity={sensor.total}
                    claimedQuantity={sensor.claimed}
                    onClaim="/dashboard/register"
                />
            ))}
        </CardContent>

    </Card>

}

export default DeviceRegistrationTracking;


export function DeviceTypeCard({ title, totalQuantity, claimedQuantity, onClaim }: IDeviceTypeCardProps) {
    const ui = getDeviceUI(title);
    const Icon = ui.icon;
    const progressValue = totalQuantity > 0 ? (claimedQuantity / totalQuantity) * 100 : 0;
    const isComplete = claimedQuantity === totalQuantity;

    return (
        <div className="flex bg-white dark:bg-slate-950 items-center w-full">
            <div className={`p-2.5 rounded-md ${ui.bgColor} ${ui.textColor}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="w-full flex flex-col gap-2 pl-3">
                <div className="flex items-center gap-2 justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{totalQuantity}x {ui.label}</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400">{claimedQuantity}/{totalQuantity} Registados</p>
                        {!isComplete && (
                            <HardwareRegistrationDialog
                                title="Registe os seus sensores"
                                description="Scanne os sensores para começar a adquirir os seus dados"
                            >
                                <Button variant="ghost" size="icon-sm" asChild>
                                    <QrCode />
                                </Button>
                            </HardwareRegistrationDialog>

                        )}
                    </div>
                </div>
                <Progress value={progressValue} className="h-1.5" />
            </div>


        </div>
    );
}

