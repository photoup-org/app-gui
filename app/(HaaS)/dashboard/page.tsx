import { Suspense } from "react";
import { PendingHardwareSection, PendingHardwareSkeleton } from "@/components/haas/dashboard/hardware-claim/PendingHardwareSection";
import { DashboardOverviewRow } from "@/components/haas/dashboard/overview/DashboardOverviewRow";
import OverviewSkeleton from "@/components/haas/dashboard/overview/OverviewSkeleton";



export default async function DashboardPage() {
  return (
    <div className="flex flex-col items-start w-full gap-8">
      <Suspense fallback={<PendingHardwareSkeleton />}>
        <PendingHardwareSection />
      </Suspense>
      <Suspense fallback={<OverviewSkeleton />}>
        <DashboardOverviewRow />
      </Suspense>

    </div>
  );
}
