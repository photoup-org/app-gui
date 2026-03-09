"use client";

import * as React from "react";
import { HelpCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoTooltipProps {
    text?: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
    if (!text) return null;

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ml-1"
                    >
                        <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-teal-500 transition-colors" aria-hidden="true" />
                        <span className="sr-only">Mais informações</span>
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px] text-center text-sm">
                    <p>{text}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
