"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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
                    asChild
                >
                    <Link href="?newProject=true" scroll={false}>
                        <PlusSquare size={24} strokeWidth={1.5} />
                    </Link>
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
