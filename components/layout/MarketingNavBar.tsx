"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/resources/logos";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function MarketingNavBar() {
    return (
        <header className="sticky top-0 z-50 w-full bg-background border-b border-border/40">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <BrandLogo />
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                        Home
                    </Link>
                    <Link href="/software" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                        Software
                    </Link>
                    <Link href="/technology" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                        Tecnologia
                    </Link>
                    <Link href="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                        Planos
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild className="hidden md:inline-flex">
                        <Link href="/login">
                            Login
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/demo">
                            Live Demo
                        </Link>
                    </Button>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
