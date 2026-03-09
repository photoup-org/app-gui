import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton"
import { LandingPageHeroSectionMaskUrl } from "../../resources/masks"
import { ArrowDown, ArrowUp } from "lucide-react"
import ImageWithShadow from "./ImageWithShadow"
import landingIndustryImg from "../../resources/images/home/landing_industry.png"
import landingLabImg from "../../resources/images/home/landing_lab.png"

export default function HeroSection() {
    return (
        <section className="relative w-full overflow-hidden bg-background">
            <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-24">

                {/* Mobile View: Stacked Layout (< lg) */}
                <div className="flex flex-col gap-6 lg:hidden w-full">
                    {/* Main Image */}
                    <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden shadow-sm shrink-0">
                        <ImageWithSkeleton
                            src={landingIndustryImg}
                            alt="Main IoT Dashboard"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    {/* Text Card */}
                    <div className="w-full bg-shadow-bg rounded-3xl p-8 shadow-sm text-foreground shrink-0">
                        <h3 className="text-2xl font-bold mb-3 text-foreground">Real-time Insights</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Monitor millions of devices globally with unmatched precision and speed.
                            Experience ultra-low latency data ingestion.
                        </p>
                    </div>
                    {/* Secondary Image */}
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-sm shrink-0">
                        <ImageWithSkeleton
                            src={landingLabImg}
                            alt="Data visualization"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Desktop View: Bento Grid with SVG Mask (lg:block) */}
                <div className="hidden lg:block relative w-full aspect-1003/624 isolate ">
                    <ImageWithShadow
                        src={landingLabImg} alt="Data visualization" position="top-0 right-0" size="w-[480px] h-[250px]" shadowPosition="top-right" />


                    <div className="absolute bottom-0 left-0 w-80 h-52 bg-shadow-bg px-8 flex flex-col gap-2 justify-center z-10 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 ">Com o nosso Software</h3>
                        <p className=" text-muted-foreground leading-relaxed flex gap-2">
                            <ArrowUp className="text-primary" />
                            Eficiência Operacional
                        </p>
                        <p className=" text-muted-foreground leading-relaxed  flex gap-2">
                            <ArrowDown className="text-destructive" /> Custos de Manutenção
                        </p>
                        <p className=" text-muted-foreground leading-relaxed  flex gap-2">
                            <ArrowUp className="text-primary" />
                            Previsibilidade
                        </p>
                    </div>
                    <div
                        className="absolute -bottom-4 -left-4 inset-0 overflow-hidden z-1 bg-shadow-bg"
                        style={{
                            WebkitMaskImage: `url("${LandingPageHeroSectionMaskUrl}")`,
                            maskImage: `url("${LandingPageHeroSectionMaskUrl}")`,
                            WebkitMaskSize: '100% 100%',
                            maskSize: '100% 100%',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskPosition: 'center',
                        }}
                    >

                    </div>
                    <div
                        className="absolute inset-0 overflow-hidden z-1"
                        style={{
                            WebkitMaskImage: `url("${LandingPageHeroSectionMaskUrl}")`,
                            maskImage: `url("${LandingPageHeroSectionMaskUrl}")`,
                            WebkitMaskSize: '100% 100%',
                            maskSize: '100% 100%',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskPosition: 'center',
                        }}
                    >
                        <ImageWithSkeleton
                            src={landingIndustryImg}
                            alt="Main IoT Dashboard"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                </div>
            </div>
        </section>
    )
}
