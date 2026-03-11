"use client";

import React, { useRef } from 'react';
import { SerializedHardwareProduct } from '@/lib/api/products';
import AppleProductCard from '@/components/ui/AppleProductCard';
import ProductDialog from '@/components/ui/ProductDialog';
import { useProductModal } from '@/hooks/useProductModal';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface FeaturedSensorsCarouselProps {
    products: SerializedHardwareProduct[];
}

const FeaturedSensorsCarousel: React.FC<FeaturedSensorsCarouselProps> = ({ products }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const { selectedProduct, isOpen, openModal, closeModal } = useProductModal();

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
            <div className="w-full py-12 text-center text-muted-foreground">
                Nenhum sensor em destaque disponível no momento.
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                className={cn(
                    "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 w-full hide-scrollbar",
                    products.length <= 4 && "xl:grid xl:grid-cols-4 xl:overflow-visible xl:snap-none"
                )}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}} />

                {products.map((product) => (
                    <div
                        key={product.id}
                        className={cn(
                            "w-80 snap-center shrink-0",
                            products.length <= 4 && "xl:w-full" // Let grid control width on XL
                        )}
                    >
                        <AppleProductCard product={product} onClick={() => openModal(product)} />
                    </div>
                ))}
            </div>

            {/* Bottom Navigation & Link */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
                <Link
                    href="/products#collection-grid"
                    onClick={handleCollectionClick}
                    className="text-foreground font-medium hover:opacity-80 transition-opacity"
                >
                    Conheça a nossa <span className="text-[#2DD4BF]">coleção completa</span>
                </Link>

                <div className={cn("flex items-center gap-4", products.length <= 4 && "xl:hidden")}>
                    <button
                        onClick={() => scroll('left')}
                        className="bg-muted rounded-full p-3 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={20} className="text-muted-foreground" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="bg-muted rounded-full p-3 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={20} className="text-muted-foreground" />
                    </button>
                </div>
            </div>

            <ProductDialog
                product={selectedProduct}
                isOpen={isOpen}
                onClose={closeModal}
            />
        </div>
    );
};

export default FeaturedSensorsCarousel;
