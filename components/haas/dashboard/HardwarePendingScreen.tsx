import { OrderIlustration } from "../../resources/ilustrations";
import { TrackingWidget } from "./TrackingWidget";
import { Suspense } from "react";
import { TrackingWidgetSkeleton } from "./TrackingWidgetSkeleton";
import { TeamWidget } from "./TeamWidget";
import { ContactWidget } from "./ContactWidget";

interface HardwarePendingScreenProps {
    latestOrder: any; // Order with items and products
}

/**
 * Placeholder component for users who have ordered hardware but haven't registered any devices yet.
 */
export function HardwarePendingScreen({ latestOrder }: HardwarePendingScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <PendingHardwareHeader />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch justify-center max-w-xl mx-auto w-full px-4">
                <Suspense fallback={<TrackingWidgetSkeleton />}>
                    <TrackingWidget trackingNumber={latestOrder?.trackingNumber} />
                </Suspense>
                <TeamWidget />
            </div>
        </div>
    );
}

const PendingHardwareHeader = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8">
            <OrderIlustration width={300} />
            <h1 className="text-3xl font-bold">O seu espaço está quase pronto</h1>
            <h5 className="text-muted-foreground text-lg max-w-xl">O seu hardware PhotoUp já está em processamento. Enquanto aguarda a entrega, conclua estes passos para garantir que os seus dados começam a fluir no minuto em que ligar os sensores. </h5>
        </div>
    );
}

