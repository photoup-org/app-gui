import { Suspense } from "react";
import { PendingHardwareSection, PendingHardwareSkeleton } from "@/components/haas/dashboard/hardware-claim/PendingHardwareSection";



export default async function DashboardPage() {
    return (
        <div className="flex flex-col items-start w-full">
            <Suspense fallback={<PendingHardwareSkeleton />}>
                <PendingHardwareSection />
            </Suspense>
        </div>
    );
}
