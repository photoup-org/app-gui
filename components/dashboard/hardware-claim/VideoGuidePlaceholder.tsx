import { PlayCircle } from "lucide-react";

export function VideoGuidePlaceholder() {
    return (
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg p-5 shadow-sm h-full flex flex-col">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Watch: How to claim and install your gateway</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Learn how to get your devices online in minutes.</p>
            
            <div className="relative w-full rounded-md overflow-hidden bg-slate-800 flex-grow group cursor-pointer min-h-[200px]">
                <div className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110">
                    <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </div>
    );
}
