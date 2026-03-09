"use client";

import React, { useRef } from 'react';
import { SerializedHardwareProduct } from '@/lib/api/products';
import AppleProductCard from '@/components/ui/AppleProductCard';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface FeaturedSensorsCarouselProps {
    products: SerializedHardwareProduct[];
}

const FeaturedSensorsCarousel: React.FC<FeaturedSensorsCarouselProps> = ({ products }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const handleCollectionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (pathname === '/products') {
            e.preventDefault();
            const element = document.getElementById('collection-grid');
            if (element) {
                const headerOffset = 100; // Adjust for fixed headers
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            // Roughly width of card + gap
            const scrollAmount = direction === 'left' ? -340 : 340;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!products || products.length === 0) {
        return (
            <div className="w-full py-12 text-center text-gray-500">
                Nenhum sensor em destaque disponível no momento.
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-4 w-full"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}} />

                {products.map((product) => (
                    <div key={product.id} className="min-w-[280px] sm:min-w-[320px] snap-center shrink-0">
                        <AppleProductCard product={product} />
                    </div>
                ))}
            </div>

            {/* Bottom Navigation & Link */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
                <Link
                    href="/products#collection-grid"
                    onClick={handleCollectionClick}
                    className="text-gray-900 font-medium hover:opacity-80 transition-opacity"
                >
                    Conheça a nossa <span className="text-[#2DD4BF]">coleção completa</span>
                </Link>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => scroll('left')}
                        className="bg-gray-100 rounded-full p-3 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={20} className="text-gray-700" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="bg-gray-100 rounded-full p-3 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={20} className="text-gray-700" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeaturedSensorsCarousel;
