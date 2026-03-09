import prisma from "@/lib/prisma";
import { HardwareProduct as PrismaHardwareProduct } from "@prisma/client";

export type SerializedHardwareProduct = Omit<PrismaHardwareProduct, 'price' | 'createdAt' | 'updatedAt'> & {
    price: number;
    createdAt: string;
    updatedAt: string;
    subtitle: string;
    imageUrl: string | null;
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
            subtitle: (product as any).subtitle || '',
        }));
    } catch (error) {
        console.error("Failed to fetch featured sensors:", error);
        return [];
    }
}

export const getAllSensors = async (): Promise<SerializedHardwareProduct[]> => {
    try {
        const allSensors = await prisma.hardwareProduct.findMany({
            where: {
                type: {
                    in: ['SENSOR_BASE', 'SENSOR_PREMIUM']
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return allSensors.map(product => ({
            ...product,
            price: Number(product.price),
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
            subtitle: (product as any).subtitle || '',
        }));
    } catch (error) {
        console.error("Failed to fetch all sensors:", error);
        return [];
    }
}
