
import HardwareSection from "@/components/marketing/home/HardwareSection";
import HeroSection from "@/components/marketing/home/HeroSection";
import HomeFAQSection from "@/components/marketing/home/HomeFAQSection";
import TitleComponent from "@/components/marketing/home/TitleComponent";
import SolutionsSections from "@/components/marketing/home/SolutionsSections";
import MainPageSection from "@/components/marketing/MainPageSection";

export default function Page() {

    return (<MainPageSection>
        <TitleComponent />
        <HeroSection />
        <SolutionsSections />
        <HardwareSection />
        <HomeFAQSection />
    </MainPageSection>
    );
}