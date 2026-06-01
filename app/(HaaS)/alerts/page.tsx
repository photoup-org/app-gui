import { Suspense } from "react";
import { getAllIncidentLogsAction } from "../logs/actions";
import IncidentesTable from "@/components/haas/incidentes/IncidentesTable";

export default async function IncidentesPage() {
  const data = await getAllIncidentLogsAction();

  return (
    <div className="flex flex-col w-full gap-6 max-w-[1200px] mx-auto px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Incidentes e Sistema
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Acompanhe todos os eventos de sistema, alertas de hardware e registos de experiência.
        </p>
      </div>

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
