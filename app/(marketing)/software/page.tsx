import MainPageSection from '@/components/marketing/MainPageSection'
import AssistentComponent from '@/components/marketing/software/AssistentComponent'
import CTA from '@/components/marketing/software/CTA'
import DashboardDisplayComponent from '@/components/marketing/software/DashboardDisplayComponent'
import SoftwareFAQSection from '@/components/marketing/software/SoftwareFAQSection'
import TitleComponent from '@/components/marketing/software/TitleComponent'

const SoftwarePage = () => {
    return <MainPageSection className="flex flex-col gap-20 items-center">
        <TitleComponent />
        <DashboardDisplayComponent />
        <AssistentComponent />
        <CTA />
        <SoftwareFAQSection />
    </MainPageSection>
}

export default SoftwarePage