import { Suspense } from "react";
import { getAllIncidentLogsAction } from "../logs/actions";
import IncidentesTable from "@/components/haas/incidentes/IncidentesTable";

export default async function IncidentesPage() {
  const data = await getAllIncidentLogsAction();

  return (
    <div className="flex-1 flex flex-col w-full gap-6 px-6 py-8">


      <Suspense fallback={
        <div className="w-full h-96 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" />
      }>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <IncidentesTable data={data.logs} />
        </div>
      </Suspense>
    </div>
  );
}
