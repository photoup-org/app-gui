import MainPageSection from '@/components/marketing/MainPageSection'
import TechFAQSection from '@/components/marketing/technology/TechFAQSection'
import { getAllSensors } from '@/lib/api/products'
import FeaturedSensorsCarousel from '@/components/marketing/FeaturedSensorsCarousel'
import FilterableProductGrid from '@/components/marketing/products/FilterableProductGrid'

export const dynamic = 'force-dynamic'; // We can safely assume sensors list changes frequently or we want fresh queries. Or we omit it and let next dictate.

const ProductsPage = async () => {
    // Phase 1: Server-Side Data Fetching
    const allSensors = await getAllSensors();

    // Phase 1: Data Splitting
    const featuredSensors = allSensors.filter(sensor => sensor.isFeatured);

    return (
        <MainPageSection className="flex flex-col gap-20 items-center py-12 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

            {/* Top Section */}
            <div className="w-full flex flex-col items-center gap-12">
                <div className="text-center space-y-4 max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                        O Nosso Conjunto de <span className="text-[#2DD4BF]">Soluções</span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Encontre soluções para diferentes tipos de problemas e subscreva a um dos nossos planos.
                    </p>
                </div>

                <div className="w-full overflow-hidden">
                    <FeaturedSensorsCarousel products={featuredSensors} />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="w-full">
                <FilterableProductGrid initialProducts={allSensors} />
            </div>

            {/* FAQ Section */}
            <div className="w-full mt-12">
                <TechFAQSection />
            </div>

        </MainPageSection>
    )
}

export default ProductsPage