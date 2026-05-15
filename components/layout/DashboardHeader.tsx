"use client";

import { usePathname } from "next/navigation";
import { PlusSquare, ScanLine, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HardwareRegistrationDialog } from "@/components/haas/dashboard/HardwareRegistrationDialog";

export function DashboardHeader() {
    const pathname = usePathname();

    // Determine the title based on the pathname
    let title = "Visão Geral";
    if (pathname.includes("/projects")) {
        title = "Os Meus Projetos";
    } else if (pathname.includes("/settings/team")) {
        title = "Definições de Equipa";
    } else if (pathname.includes("/settings")) {
        title = "Definições";
    }

    return (
        <header className="flex items-center justify-between w-full mb-8">
            {/* Left Side: Dynamic Title */}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {title}
            </h1>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-4">
                {/* Add Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                >
                    <PlusSquare size={24} strokeWidth={1.5} />
                </Button>

                {/* Register Hardware (QR) Button */}
                <HardwareRegistrationDialog>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                    >
                        <ScanLine size={24} strokeWidth={1.5} />
                    </Button>
                </HardwareRegistrationDialog>

                {/* Notifications Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-700 hover:bg-slate-100"
                >
                    <Bell size={24} strokeWidth={1.5} />
                </Button>
            </div>
        </header>
    );
}
