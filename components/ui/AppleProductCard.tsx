import React from 'react';
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import { SerializedHardwareProduct } from '@/lib/api/products';
import { Gem, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddToCartButton from '@/components/ui/AddToCartButton';
import { useProductModal } from '@/hooks/useProductModal';
import ProductDialog from '@/components/ui/ProductDialog';

interface AppleProductCardProps {
    product: SerializedHardwareProduct;
    onClick?: () => void;
    mode?: 'catalog' | 'selection';
    quantity?: number;
    onQuantityChange?: (newQuantity: number) => void;
    customPriceDisplay?: React.ReactNode;
    maxReached?: boolean;
}

const formatProductType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const AppleProductCard: React.FC<AppleProductCardProps> = ({
    product,
    onClick,
    mode = 'catalog',
    quantity = 0,
    onQuantityChange,
    customPriceDisplay,
    maxReached = false
}) => {
    const { selectedProduct, isOpen, openModal, closeModal } = useProductModal();
    // Determine the image to display, fallback to a local visual or placeholder if none
    const displayImage = product.imageUrl || '/placeholder-sensor.jpg';

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (mode === 'catalog') {
                onClick?.();
            } else {
                openModal(product);
            }
        }
    };

    const handleCardClick = () => {
        if (mode === 'catalog') {
            if (onClick) onClick();
        } else {
            openModal(product);
        }
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[2rem] h-[500px] xl:h-[600px] w-full cursor-pointer group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2DD4BF] focus-visible:ring-offset-2 transition-all duration-300",
                mode === 'catalog' ? 'cursor-pointer' : '',
                mode === 'selection' && quantity > 0 ? 'ring-4 ring-[#2DD4BF] ring-offset-2 ring-offset-background' : ''
            )}
            role="button"
            tabIndex={0}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
        >
            {/* Background Image */}
            <ImageWithSkeleton
                src={displayImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover z-0 transition-transform duration-500 group-hover:scale-105"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/20 to-black/80 z-10 pointer-events-none transition-opacity duration-300"></div>

            {/* Content Context - Top */}
            <div className="absolute top-6 left-6 right-6 z-20 pointer-events-none flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <p className="text-gray-300 text-sm font-medium drop-shadow-sm">
                        {formatProductType(product.type)}
                    </p>
                    <h3 className="text-white text-xl md:text-2xl font-bold leading-tight max-w-[85%] drop-shadow-md">
                        {product.name}
                    </h3>
                </div>
                {/* Top Right Icon */}
                <div className={cn("text-slate-900 p-2 rounded-lg pointer-events-none shrink-0 shadow-lg", product.type === "SENSOR_BASE" ? "bg-shadow-bg" : "bg-[#2DD4BF]")}>
                    {product.type === "SENSOR_BASE" ? <ShieldCheck size={20} /> : <Gem size={20} />}
                </div>
            </div>

            {/* Content Context - Bottom */}
            <div className="absolute bottom-6 left-6 right-6 z-20 flex sm:items-end justify-between items-center gap-2 transition-transform duration-300">
                <div className="flex flex-col shrink-0 max-w-[50%]">
                    {customPriceDisplay ? (
                        customPriceDisplay
                    ) : (
                        <>
                            <span className="text-xs text-gray-300 mb-1 leading-tight">
                                {product.type === 'SENSOR_BASE' || product.price === 0 ? 'Incluídos' : 'A partir de'}
                            </span>
                            <span className="text-white text-2xl sm:text-3xl font-bold whitespace-nowrap">
                                {product.type === 'SENSOR_BASE' || product.price === 0 ? '0 €' : `${Number(product.price) / 100} €`}
                            </span>
                        </>
                    )}
                </div>
                {/*
                    Stop propagation on the inner link/button so that clicking
                    "Escolher Plano" doesn't also trigger the modal open
                */}
                {mode === 'selection' ? (
                    <div className="z-30 shrink-0 flex items-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 p-1">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onQuantityChange?.(Math.max(0, quantity - 1)); }}
                            className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                        >
                            -
                        </button>
                        <span className="w-8 text-center text-white font-medium">{quantity}</span>
                        <button
                            type="button"
                            disabled={maxReached}
                            onClick={(e) => { e.stopPropagation(); onQuantityChange?.(quantity + 1); }}
                            className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                                maxReached ? "text-white/30 cursor-not-allowed" : "text-white hover:bg-white/20"
                            )}
                        >
                            +
                        </button>
                    </div>
                ) : (
                    <AddToCartButton
                        product={product}
                        className="z-30 shrink-0 px-3 sm:px-6 py-2.5 w-full sm:w-auto text-xs sm:text-sm"
                    />
                )}
            </div>

            <ProductDialog
                product={selectedProduct}
                isOpen={isOpen}
                onClose={closeModal}
            />
        </div>
    );
};

export default AppleProductCard;
