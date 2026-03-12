"use server";

import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

/**
 * Checks if a given NIF/VAT number already exists in the Organization table.
 * Used by the frontend Stripe Elements checkout form to warn users if their
 * legal entity already uses the platform, prompting them to proceed carefully.
 * 
 * @param nif The VAT/NIPC number to check
 * @returns boolean indicating whether the NIF exists
 */
export async function checkNifExists(nif: string): Promise<boolean> {
    if (!nif || nif.trim() === "") {
        return false;
    }

    try {
        const org = await prisma.organization.findUnique({
            where: { nif: nif.trim() }
        });

        return !!org;
    } catch (error) {
        console.error("[CheckoutAction] Error checking NIF:", error);
        // Fail open: assume it doesn't exist to not block checkout on DB error, 
        // the webhook upsert logic will handle it gracefully anyway.
        return false;
    }
}

export const getPlanAndSensors = unstable_cache(
    async (productId: string) => {
        try {
            const plan = await prisma.planTier.findUnique({
                where: { stripeProductId: productId }
            });

            const sensors = await prisma.hardwareProduct.findMany({
                where: {
                    type: {
                        in: ['SENSOR_BASE', 'SENSOR_PREMIUM']
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            // Serialize correctly, converting Decimals to numbers and Dates to strings.
            const serializedPlan = plan ? {
                ...plan,
                uiFeatureMatrix: plan.uiFeatureMatrix ? JSON.stringify(plan.uiFeatureMatrix) : null,
            } : null;

            const serializedSensors = sensors.map(product => ({
                ...product, // Decimals need Number()
                price: Number(product.price),
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
                subtitle: (product as any).subtitle || '',
            }));

            return { plan: serializedPlan, sensors: serializedSensors };
        } catch (error) {
            console.error("Error fetching plan and sensors:", error);
            return { plan: null, sensors: [] };
        }
    },
    ['catalog-plan-sensors'],
    {
        tags: ['catalog'],
        revalidate: 3600 // Cache for 1 hour
    }
);
