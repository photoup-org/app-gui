"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface UsageBarProps {
  label: string;
  used: number;
  limit: number | null;
  className?: string;
  suffix?: ReactNode;
}

/**
 * UsageBar displays a label, usage stats, and a progress bar.
 * It handles the "Ilimitado" logic for null limits and caps progress at 100%.
 */
export function UsageBar({
  label,
  used,
  limit,
  className,
  suffix,
}: UsageBarProps) {
  const calculateProgress = (used: number, limit: number | null) => {
    if (limit === null || limit === 0) return 100;
    const percentage = (used / limit) * 100;
    return Math.min(percentage, 100);
  };

  const renderLimitText = (limit: number | null) => {
    return limit === null ? "Ilimitado" : limit;
  };

  const progress = calculateProgress(used, limit);

  return (
    <div className={cn("mb-4", className)}>
      <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-700 dark:text-slate-200">
            {used}/{renderLimitText(limit)}
          </span>
          {suffix}
        </div>
      </div>
      <div className="h-1.5 w-full bg-white dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
