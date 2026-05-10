"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { UsageBar } from "./UsageBar";

/**
 * PlanUsageWidget displays the current hardware and user usage
 * against the department's plan limits in the sidebar.
 */
export function PlanUsageWidget() {
  const { state } = useApp();
  const { workspace } = state;
  const { planName, isTopTier, sensors, users } = workspace.planStats;

  const getUpgradeLabel = () => {
    return planName.toLowerCase() === "starter" ? "Industrial Pro" : "Executivo";
  };

  return (
    <div className="p-4 bg-primary-bg dark:bg-cyan-950/20 rounded-2xl transition-all">
      {/* Header Link */}
      <Link
        href="/dashboard/settings/plan"
        className="flex items-center justify-between mb-3 group/header"
      >
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {planName}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-cyan-600/50 group-hover/header:translate-x-0.5 transition-transform" />
      </Link>

      {/* Users Tracker */}
      <UsageBar label="Utilizadores" used={users.used} limit={users.limit} />

      {/* Sensors Tracker */}
      <UsageBar
        label="Sensores"
        used={sensors.used}
        limit={sensors.limit}
        className="mb-6"
        suffix={
          <Link
            href="/dashboard/inventory"
            className="p-1 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 rounded-md transition-colors text-cyan-600 dark:text-cyan-400"
            title="Ver Inventário"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        }
      />

      {/* Upgrade Button */}
      {!isTopTier && (
        <Button
          asChild
          variant="default"
          className="w-full bg-primary text-white border-none h-10 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Link href="/dashboard/settings/plan">
            Upgrade para {getUpgradeLabel()}
          </Link>
        </Button>
      )}
    </div>
  );
}

