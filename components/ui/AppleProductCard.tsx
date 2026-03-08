import React from 'react';
import Image from 'next/image';
import { SerializedHardwareProduct } from '@/lib/api/products';
import { Activity, Gem, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            <Image
                src={displayImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover z-0 transition-transform duration-500 group-hover:scale-105"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/20 to-transparent z-10 pointer-events-none"></div>

            {/* Content Context */}
            <div className="absolute top-6 left-6 right-6 z-20 pointer-events-none">
                <p className="text-gray-300 text-sm font-medium mb-1 drop-shadow-sm">
                    {product.name}
                </p>
                <h3 className="text-white text-xl font-bold leading-tight max-w-[80%] drop-shadow-md">
                    {product.subtitle}
                </h3>
            </div>

            {/* Top Right Icon */}
            <div className={cn("absolute top-6 right-6 z-20  text-black p-2 rounded-lg pointer-events-none", product.type === "SENSOR_BASE" ? "bg-shadow-bg" : "bg-primary")}>
                {product.type === "SENSOR_BASE" ? <ShieldCheck size={24} /> : <Gem size={24} />}
            </div>
        </div>
    );
};

export default AppleProductCard;
