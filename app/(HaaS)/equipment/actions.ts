"use server";

import prisma from "@/lib/prisma";
import { DeviceStatus } from "@prisma/client";
import { getAppSession } from "@/lib/auth/session";

export async function getDevicesByStatusAction(status: string) {
    try {
        const session = await getAppSession();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        // Map UI pseudo-statuses (BUSY, OFFLINE) to their Prisma base status (ACTIVE)
        const queryStatus = (status === 'BUSY' || status === 'OFFLINE') 
            ? 'ACTIVE' 
            : (status as DeviceStatus);

        const whereClause: any = { status: queryStatus };

        // For 'BUSY', we need to check if it's allocated to a running experiment
        if (status === 'BUSY') {
            whereClause.experiments = {
                some: { status: 'RUNNING' }
            };
        }

        const devices = await prisma.device.findMany({
            where: whereClause,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                },
                experiments: {
                    where: { status: 'RUNNING' },
                    select: { id: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { success: true, data: devices };
    } catch (error) {
        console.error("Failed to fetch devices by status:", error);
        return { success: false, error: "Failed to fetch devices" };
    }
}
