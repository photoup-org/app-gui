"use client";

import { useRouter } from "next/navigation";
import HeroSection from "@/components/marketing/HeroSection";

export default function Page() {
    const router = useRouter();

    return (
        <div className="min-h-screen">
            <HeroSection />
        </div>
    );
}