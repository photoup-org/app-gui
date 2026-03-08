import MainPageSection from '@/components/marketing/MainPageSection'
import TitleComponent from '@/components/marketing/technology/TitleComponent'
import InteractiveLabMap from '@/components/marketing/technology/InteractiveLabMap'
import GatewaySection from '@/components/marketing/technology/GatewaySection'
import SensorSection from '@/components/marketing/technology/SensorSection'
import TechFAQSection from '@/components/marketing/technology/TechFAQSection'

const PageTechnology = () => {
    return (
        <MainPageSection>
            <TitleComponent />
            <InteractiveLabMap />
            <GatewaySection />
            <SensorSection />
            <TechFAQSection />
        </MainPageSection>
    )
}

export default PageTechnology