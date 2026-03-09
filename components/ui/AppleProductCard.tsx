import React from 'react';
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import { SerializedHardwareProduct } from '@/lib/api/products';
import { Activity, Gem, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AppleProductCardProps {
    product: SerializedHardwareProduct;
}

const formatProductType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const AppleProductCard: React.FC<AppleProductCardProps> = ({ product }) => {
    // Determine the image to display, fallback to a local visual or placeholder if none
    const displayImage = product.imageUrl || '/placeholder-sensor.jpg';

    return (
        <div className="relative overflow-hidden rounded-[2rem] h-[400px] sm:h-[500px] w-full group cursor-pointer">
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
                <div className={cn("text-black p-2 rounded-lg pointer-events-none shrink-0 shadow-lg", product.type === "SENSOR_BASE" ? "bg-shadow-bg" : "bg-[#2DD4BF]")}>
                    {product.type === "SENSOR_BASE" ? <ShieldCheck size={20} /> : <Gem size={20} />}
                </div>
            </div>

            {/* Content Context - Bottom */}
            <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4 transition-transform duration-300">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-300 mb-1">
                        {product.type === 'SENSOR_BASE' || product.price === 0 ? 'Incluído nos planos' : 'A partir de'}
                    </span>
                    <span className="text-white text-3xl font-bold">
                        {product.type === 'SENSOR_BASE' || product.price === 0 ? '0 €' : `${product.price} €`}
                    </span>
                </div>

                <Link href="/planos" className="z-30">
                    <button className="bg-[#2DD4BF] hover:bg-[#20b2aa] text-white px-6 py-2.5 rounded-full font-medium transition-colors w-full sm:w-auto text-sm shadow-md">
                        Escolher Plano
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default AppleProductCard;
