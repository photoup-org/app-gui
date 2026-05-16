import { Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface SetupBannerProps {
    overallPercentage?: number;
}

export function SetupBanner({ overallPercentage }: SetupBannerProps) {
    return (
        <div className="bg-blue-50/50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 w-full">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 shrink-0">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 w-full max-w-md">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Finish setting up your lab</h2>
                        {overallPercentage !== undefined && (
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{Math.round(overallPercentage)}%</span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">You have devices ready to be linked to your workspace. Start the setup process to begin monitoring.</p>
                    {overallPercentage !== undefined && (
                        <Progress value={overallPercentage} className="h-1.5 w-full bg-blue-100 dark:bg-slate-800" />
                    )}
                </div>
            </div>
            <Button asChild className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white mt-4 sm:mt-0">
                <Link href="/dashboard/devices/claim">
                    Configure Device
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </Button>
        </div>
    );
}
