"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings, Users, BarChart, LogOut } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            active: pathname === "/dashboard",
        },
        {
            label: "Analytics",
            icon: BarChart,
            href: "/analytics",
            active: pathname === "/analytics",
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/settings",
            active: pathname === "/settings",
        },
        {
            label: "Users",
            icon: Users,
            href: "/users",
            active: pathname === "/users",
        },
        {
            label: "Logout",
            icon: LogOut,
            href: "/auth/logout",
            active: false,
        },
    ];

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        IoT Monitor
                    </h2>
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors",
                                    route.active ? "bg-slate-100 text-slate-900" : "text-slate-500"
                                )}
                            >
                                <route.icon className={cn("mr-2 h-4 w-4", route.active ? "text-slate-900" : "text-slate-500")} />
                                {route.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
