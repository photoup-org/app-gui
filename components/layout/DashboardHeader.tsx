"use client";

import { usePathname } from "next/navigation";
import { PlusSquare, ScanLine, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HardwareRegistrationDialog } from "@/components/haas/dashboard/HardwareRegistrationDialog";
import { useProjectStore } from "@/hooks/useProjectStore";

const ROUTE_TITLES: Record<string, string> = {
    '/': 'Visão Geral',
    '/dashboard': 'Visão Geral',
    '/projects': 'Os Meus Projetos',
    '/inventory': 'Inventário',
    '/alerts': 'Alertas',
    '/incidentes': 'Incidentes',
    '/logs': 'Logs do Sistema',
    '/reports': 'Relatórios',
    '/settings': 'Definições',
    '/settings/team': 'Definições de Equipa',
};

export function DashboardHeader() {
    const pathname = usePathname();
    const { openDialog } = useProjectStore();

    // Determine the title based on the pathname
    let title = ROUTE_TITLES[pathname];

    if (!title) {
        if (pathname.startsWith('/projects/')) {
            title = 'Detalhes do Projeto';
        } else if (pathname.startsWith('/settings/')) {
            title = 'Definições';
        } else {
            title = 'Visão Geral';
        }
    }

    return (
        <header className="flex items-center justify-between w-full mb-12">
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
                    onClick={openDialog}
                >
                    <PlusSquare size={24} strokeWidth={1.5} />
                </Button>

                <HardwareRegistrationDialog>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                    >
                        <ScanLine size={20} strokeWidth={1.5} />
                    </Button>
                </HardwareRegistrationDialog>

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-700 hover:bg-slate-100"
                >
                    <Bell size={20} strokeWidth={1.5} />
                </Button>
            </div>
        </header>
    );
}
