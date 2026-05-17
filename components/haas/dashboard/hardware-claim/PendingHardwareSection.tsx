import { getHardwareSetupProgress } from "@/lib/data/hardware";
import { getAppSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/services/workspace";
import DeviceRegistrationTracking from "./DeviceRegistrationTracking";
import { InstallationGuidesCarousel } from "./InstallationGuidesCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import GeneralSensorRegisterCard from "./GeneralSensorRegisterCard";
import ReportProblemCard from "./ReportProblemCard";
import { SetupAnimatedWrapper } from "./SetupAnimatedWrapper";

export async function PendingHardwareSection() {
    const session = await getAppSession();
    if (!session?.user?.sub) return null;

    const userContext = await getUserWorkspaceContext(session.user.sub);
    if (!userContext?.department) return null;

    const data = await getHardwareSetupProgress(userContext.department.id);
    if (!data) return null;
    
    let totalDevices = data.gateways.total;
    let totalClaimed = data.gateways.claimed;
    data.sensors.forEach(s => {
        totalDevices += s.total;
        totalClaimed += s.claimed;
    });

    if (totalDevices === 0) return null;

    const isComplete = totalDevices > 0 && totalDevices === totalClaimed;

    return (
        <SetupAnimatedWrapper isComplete={isComplete}>
            <section className="space-y-6 w-full h-80 flex justify-between items-center gap-5">
                <GeneralSensorRegisterCard
                    deviceList={data}
                    title="O Seu Pedido"
                />
                <DeviceRegistrationTracking
                    sensorList={data.sensors}
                />
                <ReportProblemCard />
                <InstallationGuidesCarousel />
            </section>
        </SetupAnimatedWrapper>
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