"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Folder, Boxes, Book, TriangleAlert, PanelRightOpen, PanelLeftOpen, SearchIcon, LucideIcon, Settings, MessageCircleQuestion } from "lucide-react";
import { BrandLogo } from "../resources/logos";
import { Button } from "../ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Kbd } from "../ui/kbd";
import { useApp } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    toggleSidebar: () => void;
    collapsed: boolean;
    className?: string;
}

export function Sidebar({ className, toggleSidebar, collapsed }: SidebarProps) {

    return (
        <div className={cn("pb-12 px-4 h-screen", className)}>
            <div className="flex flex-col justify-between h-full">
                <div className="">
                    <NavigationHeader toggleSidebar={toggleSidebar} collapsed={collapsed} />
                    <NavigationSearchBar />
                    <NavigationItemList className="mt-14" collapsed={collapsed} />
                </div>
                <NavigationFooter collapsed={collapsed} />
            </div>
        </div>
    );
}

const NavigationHeader = ({ toggleSidebar, collapsed }: { toggleSidebar: () => void; collapsed: boolean }) => {
    return <div className={cn("w-full flex items-center transition-all duration-300", collapsed ? "justify-center" : "justify-between mb-4")}>
        {!collapsed && <BrandLogo height={40} className="transition-opacity duration-300" />}
        <Button size="icon" variant="ghost" className="text-muted-foreground shrink-0" onClick={toggleSidebar}>
            {collapsed ? <PanelLeftOpen size={24} /> : <PanelRightOpen size={24} />}
        </Button>
    </div>
}

const NavigationSearchBar = () => {
    return <InputGroup className="max-w-sm">
        <InputGroupInput placeholder="Pesquisar..." />
        <InputGroupAddon>
            <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
        </InputGroupAddon>
    </InputGroup>
}

type TRoute = {
    label: string,
    icon: LucideIcon,
    href: string,
    active: boolean,
}

const NavigationItemList = ({ className, collapsed }: { className?: string, collapsed: boolean }) => {
    const pathname = usePathname();

    const routes: TRoute[] = [
        {
            label: "Visão Geral",
            icon: LayoutDashboard,
            href: "/dashboard",
            active: pathname === "/dashboard",
        },
        {
            label: "Projetos",
            icon: Folder,
            href: "/projects",
            active: pathname === "/projects",
        },
        {
            label: "Inventário",
            icon: Boxes,
            href: "/inventory",
            active: pathname === "/inventory",
        },
        {
            label: "Relatórios",
            icon: Book,
            href: "/reports",
            active: pathname === "/reports",
        },
        {
            label: "Incidentes",
            icon: TriangleAlert,
            href: "/alerts",
            active: pathname === "/alerts",
        },
    ];
    return <div className={cn("space-y-1", className)}>
        {routes.map((route) => <NavigationItem key={route.href} route={route} collapsed={collapsed} />)}
    </div>
}

const NavigationItem = ({ route, collapsed }: { route: TRoute, collapsed: boolean }) => {
    return <Link
        key={route.href}
        href={route.href}
        className={cn(
            "flex items-center rounded-md p-3 text-sm font-medium hover:bg-primary-bg hover:text-slate-900 transition-all duration-300",
            route.active ? "bg-primary-bg text-slate-900 font-bold" : "text-muted-foreground",
            collapsed ? "justify-center px-2" : "justify-start"
        )}
    >
        <route.icon strokeWidth={route.active ? 3 : 2} className={cn("h-5 w-5 shrink-0", route.active ? "text-slate-900" : "text-slate-500", !collapsed && "mr-3")} />
        {!collapsed && <span className="truncate opacity-100 transition-opacity duration-300">{route.label}</span>}
    </Link>
}

const NavigationFooter = ({ collapsed }: { collapsed: boolean }) => {
    return <div className="space-y-3">
        <PlanLimits />
        <FooterNavigation collapsed={collapsed} />
        <UserMenu collapsed={collapsed} />
    </div>
}


const PlanLimits = () => {
    return "PLAN LIMITS"
}

const FooterNavigation = ({ collapsed }: { collapsed: boolean }) => {

    const routes = [
        {
            label: "Definições",
            icon: Settings,
            href: "/settings",
            active: false,
        },
        {
            label: "Apoio ao Cliente",
            icon: MessageCircleQuestion,
            href: "/support",
            active: false,
        },
    ]
    return <div className="space-y-1">
        {routes.map((route) => <NavigationItem key={route.href} route={route} collapsed={collapsed} />)}
    </div>
}

const UserMenu = ({ collapsed }: { collapsed: boolean }) => {
    const { state } = useApp();
    const { name, email } = state.user;
    console.log(state)
    return <div className="w-full px-3 py-2 bg-muted/80 rounded-xl space-x-3 flex items-center cursor-pointer hover:bg-primary-bg transition-colors duration-300">
        <Avatar>
            <AvatarImage src={state.user.picture!} />
            <AvatarFallback>{name ? name.charAt(0).toUpperCase() : ""}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-1">
            <div className="text-sm font-semibold">Olá {name!.split(" ")[0]!}</div>
            <div className="text-xs text-muted-foreground">{email}</div>
        </div>
    </div>
}