"use client";

import React, { useState, useMemo } from 'react';
import { SerializedHardwareProduct } from '@/lib/api/products';
import AppleProductCard from '@/components/ui/AppleProductCard';
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    A Nossa Coleção
                </h2>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Filters */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setFilterType('ALL')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                filterType === 'ALL'
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFilterType('SENSOR_BASE')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                filterType === 'SENSOR_BASE'
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            Incluídos no Plano (Base)
                        </button>
                        <button
                            onClick={() => setFilterType('SENSOR_PREMIUM')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                filterType === 'SENSOR_PREMIUM'
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            Premium
                        </button>
                    </div>

                    {/* Sorting */}
                    <div className="w-48">
                        <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortType)}>
                            <SelectTrigger className="w-full bg-white border-gray-200">
                                <div className="flex items-center gap-2 text-gray-600">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProducts.map(product => (
                        <AppleProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center text-gray-500 rounded-2xl border-2 border-dashed border-gray-200">
                    Nenhum sensor encontrado para os filtros selecionados.
                </div>
            )}
        </div>
    );
};

export default FilterableProductGrid;
