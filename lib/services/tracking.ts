import { TrackingInfo } from "@/types/tracking";

/**
 * Mock service to simulate a third-party transportation API request.
 * Useful for development until a final provider is integrated.
 * 
 * @param trackingNumber The order tracking number
 * @returns TrackingInfo with simulated status and dates
 */
export async function getMockTrackingStatus(trackingNumber: string): Promise<TrackingInfo> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Fallback if no number provided (though the action ensures it)
    const activeNumber = trackingNumber || "DW54598158521PT";

    return {
        trackingNumber: activeNumber,
        statusTitle: "A Caminho",
        statusDescription: "Chegou ao centro operacional",
        updateDate: "13 mar",
        updateTime: "17:44:10"
    };
}
