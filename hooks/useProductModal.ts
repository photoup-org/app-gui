import { useState, useCallback } from 'react';
import { SerializedHardwareProduct } from '@/lib/api/products';

export const useProductModal = () => {
    const [selectedProduct, setSelectedProduct] = useState<SerializedHardwareProduct | null>(null);

    const openModal = useCallback((product: SerializedHardwareProduct) => {
        setSelectedProduct(product);
    }, []);

    const closeModal = useCallback(() => {
        setSelectedProduct(null);
    }, []);

    return {
        selectedProduct,
        isOpen: !!selectedProduct,
        openModal,
        closeModal
    };
};
