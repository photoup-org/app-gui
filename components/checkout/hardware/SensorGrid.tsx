import React from 'react';
import AppleProductCard from '@/components/ui/AppleProductCard';
import type { SerializedHardwareProduct } from '@/lib/api/products';

interface SensorGridProps {
    sensors: SerializedHardwareProduct[];
    baseSensors: SerializedHardwareProduct[];
    quantities: Record<string, number>;
    includedSensors: number;
    extraSensorPriceAmount: number;
    maxReached: boolean;
    onQuantityChange: (sensorId: string, newQty: number) => void;
}

export const SensorGrid: React.FC<SensorGridProps> = ({
    sensors,
    baseSensors,
    quantities,
    includedSensors,
    extraSensorPriceAmount,
    maxReached,
    onQuantityChange
}) => {
    return (
        <div className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sensors.map(sensor => {
                const isBase = sensor.type === 'SENSOR_BASE';
                const qty = quantities[sensor.id] || 0;

                let customPriceDisplay;
                if (isBase && qty > 0) {
                    let remainingFreeSim = includedSensors;
                    let thisSensorFree = 0;
                    let thisSensorPaid = 0;

                    baseSensors.forEach(s => {
                        const sqty = quantities[s.id] || 0;
                        if (s.id === sensor.id) {
                            if (remainingFreeSim > 0) {
                                thisSensorFree = Math.min(sqty, remainingFreeSim);
                                thisSensorPaid = sqty - thisSensorFree;
                            } else {
                                thisSensorPaid = sqty;
                            }
                        }
                        const f = Math.min(sqty, remainingFreeSim > 0 ? remainingFreeSim : 0);
                        remainingFreeSim -= f;
                    });

                    if (thisSensorPaid > 0) {
                        customPriceDisplay = (
                            <div className="flex flex-col">
                                <span className="text-xs tracking-wider uppercase text-destructive mb-1 leading-tight font-bold">Add-on Aplicado</span>
                                {thisSensorFree > 0 ? (
                                    <div className="text-foreground flex flex-col mt-0.5">
                                        <span className="text-lg font-bold">{thisSensorFree} Incluídos</span>
                                        <span className="text-muted-foreground font-medium text-sm">
                                            {thisSensorPaid} Extra (+{(thisSensorPaid * extraSensorPriceAmount) / 100} € /mês)
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-foreground text-xl font-bold mt-1">
                                        {thisSensorPaid} Extra (+{(thisSensorPaid * extraSensorPriceAmount) / 100} € /mês)
                                    </span>
                                )}
                            </div>
                        );
                    } else {
                        customPriceDisplay = (
                            <div className="flex flex-col">
                                <span className="text-xs tracking-wider uppercase text-primary mb-1 leading-tight font-bold">Coberto pelo Plano</span>
                                <span className="text-foreground text-3xl font-bold mt-0.5">0 €</span>
                                <span className="text-muted-foreground text-xs font-medium">/mês</span>
                            </div>
                        );
                    }
                } else if (!isBase) {
                    // For Premium sensors
                    customPriceDisplay = (
                        <div className="flex flex-col">
                            <span className="text-xs tracking-wider text-muted mb-1 font-semibold uppercase">Premium Upgrade</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-white text-3xl font-bold">{Number(sensor.price) / 100} €</span>
                                <span className="text-white text-sm">/un</span>
                            </div>
                        </div>
                    );
                }

                return (
                    <AppleProductCard
                        key={sensor.id}
                        product={sensor}
                        mode="selection"
                        quantity={qty}
                        onQuantityChange={(newQty) => onQuantityChange(sensor.id, newQty)}
                        customPriceDisplay={customPriceDisplay}
                        maxReached={maxReached}
                    />
                );
            })}
        </div>
    );
};
