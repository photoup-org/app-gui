"use client";

import { useState, useEffect } from "react";
import { ExperimentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";

interface ExperimentTimerProps {
    status: ExperimentStatus;
    accumulatedSeconds: number;
    lastRunAt: Date | null;
    endDate: Date | null;
}

function formatDuration(totalSeconds: number): string {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, "0");
    
    let formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    
    if (days > 0) {
        formatted = `${days} dia${days > 1 ? 's' : ''}, ${formatted}`;
    }
    
    return formatted;
}

export default function ExperimentTimer({ status, accumulatedSeconds, lastRunAt, endDate }: ExperimentTimerProps) {
    const [displaySeconds, setDisplaySeconds] = useState(accumulatedSeconds);

    useEffect(() => {
        // If not running, just ensure we display the accumulated time
        if (status !== 'RUNNING' || !lastRunAt) {
            setDisplaySeconds(accumulatedSeconds);
            return;
        }

        // It is running, so we need to tick
        const intervalId = setInterval(() => {
            const liveElapsed = Math.floor((Date.now() - new Date(lastRunAt).getTime()) / 1000);
            setDisplaySeconds(accumulatedSeconds + liveElapsed);
        }, 1000);

        // Immediate tick to avoid 1s delay
        const initialLiveElapsed = Math.floor((Date.now() - new Date(lastRunAt).getTime()) / 1000);
        setDisplaySeconds(accumulatedSeconds + initialLiveElapsed);

        return () => clearInterval(intervalId);
    }, [status, accumulatedSeconds, lastRunAt]);

    return (
        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 font-mono text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">
            <Timer className="w-4 h-4 text-slate-500" />
            {formatDuration(displaySeconds)}
        </Badge>
    );
}
