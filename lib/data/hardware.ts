import prisma from "@/lib/prisma";

export interface HardwareProgress {
    gateways: { total: number; claimed: number; unclaimedIds: string[] };
    sensors: { type: string; total: number; claimed: number; unclaimedIds: string[] }[];
}

export async function getHardwareSetupProgress(departmentId: string): Promise<HardwareProgress | null> {
    const devices = await prisma.device.findMany({
        where: {
            departmentId: departmentId,
        },
        include: {
            product: true,
        },
    });

    // If there are no UNCLAIMED devices, setup is considered complete (or no setup needed)
    const hasUnclaimed = devices.some(d => d.status === "UNCLAIMED");
    if (!hasUnclaimed) return null;

    const gateways = { total: 0, claimed: 0, unclaimedIds: [] as string[] };
    const sensorsMap = new Map<string, { type: string; total: number; claimed: number; unclaimedIds: string[] }>();

    for (const device of devices) {
        const isUnclaimed = device.status === "UNCLAIMED";
        
        if (device.product.type === "GATEWAY") {
            gateways.total += 1;
            if (!isUnclaimed) {
                gateways.claimed += 1;
            } else {
                gateways.unclaimedIds.push(device.id);
            }
        } else {
            const typeName = device.product.name;
            if (!sensorsMap.has(typeName)) {
                sensorsMap.set(typeName, { type: typeName, total: 0, claimed: 0, unclaimedIds: [] });
            }
            const entry = sensorsMap.get(typeName)!;
            entry.total += 1;
            if (!isUnclaimed) {
                entry.claimed += 1;
            } else {
                entry.unclaimedIds.push(device.id);
            }
        }
    }

    return {
        gateways,
        sensors: Array.from(sensorsMap.values()),
    };
}
