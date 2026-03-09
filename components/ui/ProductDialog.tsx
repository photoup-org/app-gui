import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { SerializedHardwareProduct } from '@/lib/api/products';
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton';
import { Activity, Gem, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProductDialogProps {
    product: SerializedHardwareProduct | null;
    isOpen: boolean;
    onClose: () => void;
}

const formatProductType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const ProductDialog: React.FC<ProductDialogProps> = ({ product, isOpen, onClose }) => {
    if (!product) return null;

    const displayImage = product.imageUrl || '/placeholder-sensor.jpg';
    const isBase = product.type === 'SENSOR_BASE' || product.price === 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-none rounded-[2rem] gap-0">
                {/* Header Image Section */}
                <div className="relative w-full h-[300px] sm:h-[400px]">
                    <ImageWithSkeleton
                        src={displayImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 700px"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

                    {/* Top Icons/Labels */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                        <div className={cn("text-black p-2 rounded-lg shrink-0 shadow-lg", isBase ? "bg-shadow-bg" : "bg-[#2DD4BF]")}>
                            {isBase ? <ShieldCheck size={24} /> : <Gem size={24} />}
                        </div>
                    </div>

                    {/* Image Bottom Text */}
                    <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                        <p className="text-gray-300 text-sm sm:text-base font-medium drop-shadow-sm mb-1">
                            {formatProductType(product.type)}
                        </p>
                        <DialogTitle className="text-white text-3xl sm:text-4xl font-bold leading-tight drop-shadow-md">
                            {product.name}
                        </DialogTitle>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-8 flex flex-col gap-6">
                    <DialogHeader className="text-left space-y-2">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                            {product.subtitle}
                        </h4>
                        <div className="overflow-y-auto max-h-[60vh] pr-2 prose prose-sm md:prose-base prose-teal max-w-none dark:prose-invert text-gray-600 dark:text-gray-300">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {product.description || "Descrição detalhada do sensor não disponível no momento. Contacte a nossa equipa para mais informações estruturais sobre este dispositivo."}
                            </ReactMarkdown>
                        </div>
                    </DialogHeader>

                    {/* Bottom Action Area */}
                    <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col w-full sm:w-auto text-center sm:text-left">
                            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                {isBase ? 'Incluído nos planos' : 'A partir de'}
                            </span>
                            <span className="text-gray-900 dark:text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
                                {isBase ? '0 €' : `${product.price} €`}
                            </span>
                        </div>

                        <div className="flex w-full sm:w-auto gap-4">
                            <button onClick={onClose} className="px-6 py-3 rounded-full font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto">
                                Cancelar
                            </button>
                            <Link href="/planos" className="w-full sm:w-auto flex-1">
                                <button className="w-full bg-[#2DD4BF] hover:bg-[#20b2aa] text-white px-8 py-3 rounded-full font-semibold transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                                    Adicionar ao Plano
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDialog;
