export function TrackingWidgetSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-4 w-full max-w-md animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                <div className="flex flex-col gap-2 flex-1">
                    <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                </div>
            </div>

            {/* Divider Skeleton */}
            <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

            {/* Details Skeleton */}
            <div className="flex justify-between items-center">
                <div className="h-4 w-36 bg-slate-100 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
            </div>

            {/* Button Skeleton */}
            <div className="h-11 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
    );
}
