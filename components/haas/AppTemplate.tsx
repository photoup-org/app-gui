"use client";

import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

export default function AppTemplate({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed])

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Header */}
            <header className="flex items-center border-b px-6 py-4 lg:hidden">
                <MobileNav />
                <span className="ml-4 text-lg font-semibold">IoT Monitor</span>
            </header>

            <div className="flex">
                {/* Desktop Sidebar */}
                <div className={cn(
                    "hidden lg:block border-r min-h-screen bg-gray-50/40 transition-all duration-1000 ease-in-out overflow-hidden",
                    collapsed ? "w-20" : "w-64"
                )}>
                    <Sidebar toggleSidebar={toggleSidebar} collapsed={collapsed} />
                </div>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
