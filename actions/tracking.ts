"use server";

import { getMockTrackingStatus } from "@/lib/services/tracking";
import { TrackingInfo } from "@/types/tracking";

/**
 * Server action to fetch tracking status from our mock service.
 * Standardizes the response format for easy UI handling.
 */
export async function fetchTrackingStatusAction(trackingNumber: string): Promise<
    { success: true; data: TrackingInfo } | { success: false; error: string }
> {
    try {
        if (!trackingNumber) {
            throw new Error("Tracking number is required.");
        }

        const data = await getMockTrackingStatus(trackingNumber);
        return { success: true, data };
    } catch (error: any) {
        console.error("[TrackingAction] Failed to fetch tracking status:", error);
        return { success: false, error: error.message || "Failed to fetch tracking data." };
    }
}
