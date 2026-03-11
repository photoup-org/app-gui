import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SerializedHardwareProduct } from '@/lib/api/products';
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton';
import { Gem, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AddToCartButton from '@/components/ui/AddToCartButton';
import { Button } from '@/components/ui/button';

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
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background border-none rounded-2xl gap-0">
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
                        <div className={cn("text-slate-900 p-2 rounded-lg shrink-0 shadow-lg", isBase ? "bg-shadow-bg" : "bg-[#2DD4BF]")}>
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
                        <h4 className="text-xl font-bold text-foreground">
                            {product.subtitle}
                        </h4>
                        <div className="overflow-y-auto max-h-[60vh] pr-2 prose prose-sm md:prose-base prose-teal max-w-none dark:prose-invert text-muted-foreground">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {product.description || "Descrição detalhada do sensor não disponível no momento. Contacte a nossa equipa para mais informações estruturais sobre este dispositivo."}
                            </ReactMarkdown>
                        </div>
                    </DialogHeader>

                    {/* Bottom Action Area */}
                    <div className="pt-4 mt-auto border-t border-border flex flex-col sm:flex-row items-end justify-between gap-6">
                        <div className="flex flex-col w-full sm:w-auto text-center sm:text-left">
                            <span className="text-sm text-muted-foreground mb-1">
                                {isBase ? 'Incluído nos planos' : 'A partir de'}
                            </span>
                            <span className="text-foreground text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
                                {isBase ? '0 €' : `${Number(product.price) / 100} €`}
                            </span>
                        </div>

                        <div className="flex w-full sm:w-auto gap-4 items-center">
                            <Button
                                variant="ghost"
                                size="lg"
                                onClick={onClose}
                            >
                                Cancelar
                            </Button>
                            <AddToCartButton
                                product={product}
                                onAddComplete={onClose}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDialog;
