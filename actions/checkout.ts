"use server";

import prisma from "@/lib/prisma";

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
