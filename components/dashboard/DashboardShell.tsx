"use client";

import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export default function DashboardShell({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Header */}
            <header className="flex items-center border-b px-6 py-4 lg:hidden">
                <MobileNav />
                <span className="ml-4 text-lg font-semibold">IoT Monitor</span>
            </header>

            <div className="flex">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block w-64 border-r min-h-screen bg-gray-50/40">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
