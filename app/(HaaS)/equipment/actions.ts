"use server";

import prisma from "@/lib/prisma";
import { DeviceStatus } from "@prisma/client";
import { getAppSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/services/workspace";

async function getDepartmentIdOrThrow(): Promise<string> {
  const session = await getAppSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userContext = await getUserWorkspaceContext(session.user.sub);
  if (!userContext?.department) {
    throw new Error("Department context missing");
  }

  return userContext.department.id;
}

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

export async function updateDeviceNameAction(deviceId: string, newName: string) {
    try {
        const departmentId = await getDepartmentIdOrThrow();

        // Verify the device belongs to the tenant
        const device = await prisma.device.findUnique({
            where: { id: deviceId, departmentId }
        });

        if (!device) {
            return { success: false, error: "Device not found or unauthorized" };
        }

        await prisma.device.update({
            where: { id: deviceId },
            data: { name: newName }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Failed to update device name:", error);
        return { success: false, error: error.message || "Failed to update device name" };
    }
}

export async function updateDeviceStatusAction(deviceId: string, newStatus: DeviceStatus) {
    try {
        const departmentId = await getDepartmentIdOrThrow();

        // Security Guardrail (CRITICAL): Check if the device is IN_USE
        const device = await prisma.device.findUnique({
            where: { id: deviceId, departmentId },
            include: {
                experiments: {
                    where: { status: 'RUNNING' }
                }
            }
        });

        if (!device) {
            return { success: false, error: "Device not found or unauthorized" };
        }

        if (device.experiments.length > 0) {
            return { success: false, error: "Cannot change status while device is in an active experiment." };
        }

        await prisma.device.update({
            where: { id: deviceId },
            data: { status: newStatus }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Failed to update device status:", error);
        return { success: false, error: error.message || "Failed to update device status" };
    }
}

export async function getInventoryEquipmentAction() {
    try {
        const departmentId = await getDepartmentIdOrThrow();

        const devices = await prisma.device.findMany({
            where: { departmentId },
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
    } catch (error: any) {
        console.error("Failed to fetch inventory equipment:", error);
        return { success: false, error: error.message || "Failed to fetch inventory equipment" };
    }
}
