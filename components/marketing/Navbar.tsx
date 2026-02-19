"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/resources/logos";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <BrandLogo />
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                        Home
                    </Link>
                    <Link href="/software" className="text-slate-600 hover:text-slate-900 transition-colors">
                        Software
                    </Link>
                    <Link href="/technology" className="text-slate-600 hover:text-slate-900 transition-colors">
                        Tecnologia
                    </Link>
                    <Link href="/pricing" className="text-slate-600 hover:text-slate-900 transition-colors">
                        Planos
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild className="hidden md:inline-flex">
                        <Link href="/auth/login">
                            Login
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/request-access">
                            Pedir Acesso
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
