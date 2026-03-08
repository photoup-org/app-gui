import prisma from "@/lib/prisma";
import { HardwareProduct as PrismaHardwareProduct } from "@prisma/client";

export type SerializedHardwareProduct = Omit<PrismaHardwareProduct, 'price' | 'createdAt' | 'updatedAt'> & {
    price: number;
    createdAt: string;
    updatedAt: string;
};

export const getFeaturedSensors = async (): Promise<SerializedHardwareProduct[]> => {
    try {
        const featuredProducts = await prisma.hardwareProduct.findMany({
            where: {
                isFeatured: true,
                type: {
                    in: ['SENSOR_BASE', 'SENSOR_PREMIUM']
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return featuredProducts.map(product => ({
            ...product,
            price: Number(product.price),
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
        }));
    } catch (error) {
        console.error("Failed to fetch featured sensors:", error);
        return [];
    }
}
