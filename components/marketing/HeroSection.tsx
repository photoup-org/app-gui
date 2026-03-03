import Image from "next/image"

/**
 * SVG patch that creates a smooth inverted (concave) corner.
 * By default, this covers the Top-Left corner (the solid area is at Top-Left).
 * - Rotate 90deg (`rotate-90`) to cover Top-Right.
 * - Rotate -90deg (`-rotate-90`) to cover Bottom-Left.
 * - Rotate 180deg (`rotate-180`) to cover Bottom-Right.
 */
function InvertedCorner({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
        >
            <path d="M 0 100 A 100 100 0 0 1 100 0 L 0 0 Z" fill="currentColor" />
        </svg>
    );
}

export default function HeroSection() {
    return (
        <section className="relative w-full overflow-hidden bg-background">
            <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-24">

                {/* Mobile View: Stacked Layout (< lg) */}
                <div className="flex flex-col gap-6 lg:hidden">
                    {/* Main Image */}
                    <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden shadow-sm">
                        <Image
                            src="https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80"
                            alt="Main IoT Dashboard"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    {/* Top Right Box Equivalent */}
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-sm">
                        <Image
                            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80"
                            alt="Data visualization"
                            fill
                            className="object-cover"
                        />
                    </div>
                    {/* Bottom Left Card Equivalent */}
                    <div className="w-full bg-[#fef9eb] rounded-3xl p-8 shadow-sm text-foreground">
                        <h3 className="text-2xl font-bold mb-3 text-slate-900">Real-time Insights</h3>
                        <p className="text-slate-700 leading-relaxed">
                            Monitor millions of devices globally with unmatched precision and speed.
                            Experience ultra-low latency data ingestion.
                        </p>
                    </div>
                </div>

                {/* Desktop View: Bento Grid with SVG Corner Patches (lg:block) */}
                {/* We use an explicit container height for absolute positioning to work smoothly. */}
                <div className="hidden lg:block relative w-full h-[700px] rounded-3xl isolate">

                    {/* 1. Main Base Image */}
                    {/* We do NOT need any complex masking. Just absolute positioning and rounded corners. */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden bg-muted">
                        <Image
                            src="https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80"
                            alt="Main IoT Dashboard"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* =========================================================
              TOP RIGHT SECTION
              Gap Box forms the blank padding. Then Patches smooth it.
              The internal Image sits inside it.
              ========================================================= */}

                    {/* TR Gap Box (Solid White to hide Main Image underneath). Sharp corners for the patches to fuse with. */}
                    <div className="absolute top-0 right-0 w-[384px] h-[264px] bg-background z-10" />

                    {/* TR Patches: We place white corners on the Main Image to round off the sharp Gap Box.
                        - Inner patch: at bottom-left of the TR Gap Box.
                        - Top patch: at top-left of the TR Gap Box (where it touches top edge).
                        - Right patch: at bottom-right of the TR Gap Box (where it touches right edge).
                    */}
                    {/* Inner corner: Placed ON the main image. Overlaps Gap Box by 1px up and right. */}
                    <InvertedCorner className="absolute w-8 h-8 top-[263px] right-[383px] rotate-90 text-background z-10" />

                    {/* Top edge corner: Overlaps gap box by 1px right, and hides 1px off top edge. */}
                    <InvertedCorner className="absolute w-8 h-8 -top-px right-[383px] rotate-90 text-background z-10" />

                    {/* Right edge corner: Overlaps gap box by 1px up, and hides 1px off right edge. */}
                    <InvertedCorner className="absolute w-8 h-8 top-[263px] -right-px rotate-90 text-background z-10" />

                    {/* TR Image */}
                    {/* 360x240 inside the 384x264 gap, ensuring exactly 24px padding around inner edges. */}
                    <div className="absolute top-0 right-0 w-[360px] h-[240px] rounded-[32px] overflow-hidden shadow-xl border border-white/10 z-20">
                        <Image
                            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80"
                            alt="Data visualization"
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* =========================================================
              BOTTOM LEFT SECTION
              ========================================================= */}

                    {/* BL Gap Box. Sharp corners to fuse with patches. */}
                    <div className="absolute bottom-0 left-0 w-[424px] h-[284px] bg-background z-10" />

                    {/* BL Patches: All three rotate -90deg to place the white solid at their Bottom-Left.
                        Overlap gap box by moving 1px DOWN (-1) and LEFT (-1) into it. */}
                    <InvertedCorner className="absolute w-8 h-8 -bottom-px left-[423px] -rotate-90 text-background z-10" />
                    <InvertedCorner className="absolute w-8 h-8 bottom-[283px] -left-px -rotate-90 text-background z-10" />
                    <InvertedCorner className="absolute w-8 h-8 bottom-[283px] left-[423px] -rotate-90 text-background z-10" />

                    {/* BL Text Card */}
                    {/* 400x260 inside the 424x284 gap, exactly 24px padding. */}
                    <div className="absolute bottom-0 left-0 w-[400px] h-[260px] bg-[#fef9eb] rounded-[32px] p-10 flex flex-col justify-center shadow-xl border border-black/5 z-20">
                        <h3 className="text-3xl font-bold mb-4 text-slate-900 tracking-tight">Precision Control</h3>
                        <p className="text-lg text-slate-700 leading-relaxed">
                            Command your hardware fleet seamlessly across 140+ countries.
                            Experience ultra-low latency data ingestion directly to your dashboards.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    )
}
