import prisma from '@/lib/prisma';

export async function getPlanTiers() {
    try {
        return await prisma.planTier.findMany({ orderBy: { orderIndex: 'asc' } });
    } catch (error) {
        console.error('Failed to load plans from database', error);
        return [];
    }
}

export async function getPlanTierByProductId(productId: string) {
    try {
        return await prisma.planTier.findUnique({
            where: { stripeProductId: productId }
        });
    } catch (error) {
        console.error(`Failed to load plan with product ID: ${productId}`, error);
        return null;
    }
}
