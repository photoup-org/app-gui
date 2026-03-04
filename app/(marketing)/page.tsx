"use client";

import { useRouter } from "next/navigation";
import HeroSection from "@/components/marketing/HeroSection";
import TitleSection from "@/components/marketing/TitleSection";

export default function Page() {
    const router = useRouter();

    return (
        <div className="min-h-screen">
            <TitleSection >
                <h1 className="text-6xl font-bold mb-4 text-slate-900">Torne os Seus Processos</h1>
                <h1 className="text-6xl font-bold mb-4 text-primary">Inteligentes</h1>
                <a href="/pricing" className="text-primary  mt-10 text-2xl font-bold">Começar Agora</a>
            </TitleSection>
            <HeroSection />
        </div>
    );
}