"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";

/**
 * PlanUsageWidget displays the current hardware usage (Gateways and Sensors)
 * against the department's plan limits in the sidebar.
 */
export function PlanUsageWidget() {
  const { state } = useApp();
  const stats = state.workspace.planStats;
  const { planName, isTopTier, gateways, sensors } = stats;

  const calculateProgress = (used: number, limit: number | null) => {
    if (limit === null || limit === 0) return 100;
    const percentage = (used / limit) * 100;
    return Math.min(percentage, 100);
  };

  const renderLimitText = (limit: number | null) => {
    return limit === null ? "Ilimitado" : limit;
  };

  return (
    <div className="p-4 bg-cyan-50/40 dark:bg-cyan-950/20 rounded-2xl border border-cyan-100/50 dark:border-cyan-900/30 transition-all hover:border-cyan-200 dark:hover:border-cyan-800">
      {/* Header Link */}
      <Link
        href="/dashboard/settings/plan"
        className="flex items-center justify-between mb-0.5 group/header"
      >
        <span className="text-[10px] font-bold text-cyan-600/70 dark:text-cyan-400/50 uppercase tracking-widest">
          O seu plano
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-cyan-600/50 group-hover/header:translate-x-0.5 transition-transform" />
      </Link>

      {/* Plan Title */}
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
        {planName}
      </h3>

      {/* Gateways Tracker */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5 font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Gateways</span>
          <span className="text-slate-700 dark:text-slate-200">
            {gateways.used}/{renderLimitText(gateways.limit)}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 dark:bg-cyan-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(6,182,212,0.4)]"
            style={{ width: `${calculateProgress(gateways.used, gateways.limit)}%` }}
          />
        </div>
      </div>

      {/* Sensors Tracker */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Sensores</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-700 dark:text-slate-200">
              {sensors.used}/{renderLimitText(sensors.limit)}
            </span>
            <Link
              href="/dashboard/inventory"
              className="p-1 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 rounded-md transition-colors text-cyan-600 dark:text-cyan-400"
              title="Ver Inventário"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 dark:bg-cyan-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(6,182,212,0.4)]"
            style={{ width: `${calculateProgress(sensors.used, sensors.limit)}%` }}
          />
        </div>
      </div>

      {/* Upgrade Button */}
      {!isTopTier && (
        <Button
          asChild
          variant="default"
          className="w-full bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white border-none h-10 text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Link href="/dashboard/settings/plan">
            Upgrade para Executivo
          </Link>
        </Button>
      )}
    </div>
  );
}
