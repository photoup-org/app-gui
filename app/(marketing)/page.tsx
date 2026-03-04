"use client";

import HardwareSection from "@/components/marketing/home/HardwareSection";
import HeroSection from "@/components/marketing/home/HeroSection";
import HomeFAQSection from "@/components/marketing/home/HomeFAQSection";
import HomeTitle from "@/components/marketing/home/HomeTitle";
import SolutionsSections from "@/components/marketing/home/SolutionsSections";
import MainPageSection from "@/components/marketing/MainPageSection";

export default function Page() {

    return (<MainPageSection>
        <HomeTitle />
        <HeroSection />
        <SolutionsSections />
        <HardwareSection />
        <HomeFAQSection />
    </MainPageSection>
    );
}