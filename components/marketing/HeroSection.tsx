import Image from "next/image"
import { LandingPageHeroSectionMask, LandingPageHeroSectionMaskUrl } from "../resources/masks"

export default function HeroSection() {
    return (
        <section className="relative w-full overflow-hidden bg-background">
            <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-24">

                {/* Mobile View: Stacked Layout (< lg) */}
                <div className="flex flex-col gap-6 lg:hidden w-full">
                    {/* Main Image */}
                    <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden shadow-sm shrink-0">
                        <Image
                            src="https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80"
                            alt="Main IoT Dashboard"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    {/* Text Card */}
                    <div className="w-full bg-[#fef9eb] rounded-3xl p-8 shadow-sm text-foreground shrink-0">
                        <h3 className="text-2xl font-bold mb-3 text-slate-900">Real-time Insights</h3>
                        <p className="text-slate-700 leading-relaxed">
                            Monitor millions of devices globally with unmatched precision and speed.
                            Experience ultra-low latency data ingestion.
                        </p>
                    </div>
                    {/* Secondary Image */}
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-sm shrink-0">
                        <Image
                            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80"
                            alt="Data visualization"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Desktop View: Bento Grid with SVG Mask (lg:block) */}
                <div className="hidden lg:block relative w-full max-w-5xl mx-auto aspect-1003/624 isolate overflow-hidden">

                    <div className="absolute top-0 right-0 w-[480px] h-[250px]  z-10 rounded-3xl overflow-hidden">
                        <Image
                            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80"
                            alt="Data visualization"
                            fill
                        // className="object-cover"
                        />
                    </div>


                    <div className="absolute bottom-0 left-0 w-80 h-52 bg-[#fef9eb] px-8 flex flex-col justify-center z-10 rounded-2xl">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 ">Precision Control</h3>
                        <p className=" text-slate-700 leading-relaxed">
                            Monitor millions of devices globally with unmatched precision and speed.
                        </p>
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
                        <Image
                            src="https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80"
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
