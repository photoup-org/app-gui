"use client";

import React, { useState, useMemo } from 'react';
import { SerializedHardwareProduct } from '@/lib/api/products';
import AppleProductCard from '@/components/ui/AppleProductCard';
import ProductDialog from '@/components/ui/ProductDialog';
import { useProductModal } from '@/hooks/useProductModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';

interface FilterableProductGridProps {
    initialProducts: SerializedHardwareProduct[];
}

type FilterType = 'ALL' | 'SENSOR_BASE' | 'SENSOR_PREMIUM';
type SortType = 'PRICE_ASC' | 'PRICE_DESC';

const FilterableProductGrid: React.FC<FilterableProductGridProps> = ({ initialProducts }) => {
    const [filterType, setFilterType] = useState<FilterType>('ALL');
    const [sortBy, setSortBy] = useState<SortType>('PRICE_ASC');

    // Inject Modal Logic
    const { selectedProduct, isOpen, openModal, closeModal } = useProductModal();

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...initialProducts];

        // Filtering
        if (filterType !== 'ALL') {
            result = result.filter(p => p.type === filterType);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'PRICE_ASC') {
                return a.price - b.price;
            } else {
                return b.price - a.price;
            }
        });

        return result;
    }, [initialProducts, filterType, sortBy]);

    return (
        <div className="w-full flex flex-col gap-8" id="collection-grid">
            {/* Header section with Title, Filters and Sorting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    A Nossa Coleção
                </h2>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Filters */}
                    <div className="flex bg-muted p-1 rounded-xl">
                        <button
                            onClick={() => setFilterType('ALL')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                filterType === 'ALL'
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFilterType('SENSOR_BASE')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                filterType === 'SENSOR_BASE'
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Incluídos no Plano (Base)
                        </button>
                        <button
                            onClick={() => setFilterType('SENSOR_PREMIUM')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                filterType === 'SENSOR_PREMIUM'
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Premium
                        </button>
                    </div>

                    {/* Sorting */}
                    <div className="w-48">
                        <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortType)}>
                            <SelectTrigger className="w-full bg-background border-border">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <ArrowUpDown size={14} />
                                    <SelectValue placeholder="Ordenar por" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PRICE_ASC">Preço Ascendente</SelectItem>
                                <SelectItem value="PRICE_DESC">Preço Descendente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {filteredAndSortedProducts.length > 0 ? (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProducts.map(product => (
                        <AppleProductCard
                            key={product.id}
                            product={product}
                            onClick={() => openModal(product)}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center text-muted-foreground rounded-2xl border-2 border-dashed border-border">
                    Nenhum sensor encontrado para os filtros selecionados.
                </div>
            )}

            {/* Modal Rendering */}
            <ProductDialog
                product={selectedProduct}
                isOpen={isOpen}
                onClose={closeModal}
            />
        </div>
    );
};

export default FilterableProductGrid;
