import { getHardwareSetupProgress } from "@/lib/data/hardware";
import { getAppSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/services/workspace";
import { SetupBanner } from "./SetupBanner";
import { DeviceTypeCard } from "./DeviceTypeCard";
import { VideoGuidePlaceholder } from "./VideoGuidePlaceholder";
import { Skeleton } from "@/components/ui/skeleton";

export async function PendingHardwareSection() {
    const session = await getAppSession();
    if (!session?.user?.sub) return null;

    const userContext = await getUserWorkspaceContext(session.user.sub);
    if (!userContext?.department) return null;

    const data = await getHardwareSetupProgress(userContext.department.id);
    if (!data) return null;
    if (data.gateways.total === 0 && data.sensors.length === 0) return null;

    let totalDevices = data.gateways.total;
    let totalClaimed = data.gateways.claimed;

    for (const sensor of data.sensors) {
        totalDevices += sensor.total;
        totalClaimed += sensor.claimed;
    }

    const overallPercentage = totalDevices > 0 ? (totalClaimed / totalDevices) * 100 : 0;

    return (
        <section className="space-y-6 mb-8 w-full">
            <SetupBanner overallPercentage={overallPercentage} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className="space-y-3 flex flex-col">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 px-1 mb-1">Visão Geral do Pedido</h3>
                    <div className="space-y-3">
                        {data.gateways.total > 0 && (
                            <DeviceTypeCard
                                title="Gateway"
                                totalQuantity={data.gateways.total}
                                claimedQuantity={data.gateways.claimed}
                                iconType="GATEWAY"
                                onClaim="/dashboard/devices/claim"
                            />
                        )}
                        {data.sensors.map((s) => (
                            <DeviceTypeCard
                                key={s.type}
                                title={s.type}
                                totalQuantity={s.total}
                                claimedQuantity={s.claimed}
                                iconType="SENSOR"
                                onClaim={`/dashboard/devices/claim?type=${encodeURIComponent(s.type)}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col pt-8">
                    <VideoGuidePlaceholder />
                </div>
            </div>
        </section>
    );
}

export function PendingHardwareSkeleton() {
    return (
        <div className="space-y-6 mb-8 w-full">
            <Skeleton className="h-[88px] w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className="space-y-3 flex flex-col">
                    <Skeleton className="h-6 w-48 mb-1" />
                    <div className="space-y-3">
                        <Skeleton className="h-[76px] w-full rounded-lg" />
                        <Skeleton className="h-[76px] w-full rounded-lg" />
                    </div>
                </div>
                <div className="flex flex-col pt-8">
                    <Skeleton className="h-full min-h-[200px] w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}