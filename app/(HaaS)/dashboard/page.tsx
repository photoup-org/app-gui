import { Suspense } from "react";
import { PendingHardwareSection, PendingHardwareSkeleton } from "@/app/(HaaS)/dashboard/_components/hardware-claim/PendingHardwareSection";
import { DashboardOverviewRow } from "@/app/(HaaS)/dashboard/_components/overview/DashboardOverviewRow";
import OverviewSkeleton from "@/app/(HaaS)/dashboard/_components/overview/OverviewSkeleton";
import SensorOverviewRow from "@/app/(HaaS)/dashboard/_components/sensor-overview/SensorOverviewRow";
import { SystemAdminRow } from "@/app/(HaaS)/dashboard/_components/system-admin/SystemAdminRow";
import { RunningExperimentsWidget } from "@/app/(HaaS)/dashboard/_components/RunningExperimentsWidget";


interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  const calibrationPage = Number(searchParams?.calibrationPage) || 1;
  const calibrationFilter = typeof searchParams?.calibrationFilter === 'string' ? searchParams.calibrationFilter : undefined;

  return (
    <div className="flex flex-col items-start w-full gap-8">
      <Suspense fallback={<div className="w-full h-32 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" />}>
        <RunningExperimentsWidget />
      </Suspense>
      <Suspense fallback={<PendingHardwareSkeleton />}>
        <PendingHardwareSection />
      </Suspense>
      <Suspense fallback={<OverviewSkeleton />}>
        <DashboardOverviewRow />
      </Suspense>
      <Suspense fallback={<OverviewSkeleton />}>
        <SensorOverviewRow calibrationPage={calibrationPage} calibrationFilter={calibrationFilter} />
      </Suspense>
      <Suspense fallback={<OverviewSkeleton />}>
        <SystemAdminRow />
      </Suspense>
    </div>
  );
}
