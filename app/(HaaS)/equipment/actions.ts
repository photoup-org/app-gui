"use server";

import prisma from '@/lib/core/prisma';
import { DeviceStatus } from "@prisma/client";
import { getAppSession } from '@/lib/core/auth/session';
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
                        type: true,
                        sku: true
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
                        type: true,
                        sku: true
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

export async function calibrateDeviceAction(
    deviceId: string,
    metric: string,
    points: { raw: number; reference: number }[]
) {
    try {
        const session = await getAppSession();
        if (!session?.user?.sub) {
            return { success: false, error: "Unauthorized" };
        }
        const departmentId = await getDepartmentIdOrThrow();

        // 1. Fetch the user's internal DB ID (using Auth0 sub)
        const user = await prisma.user.findUnique({
            where: { auth0UserId: session.user.sub }
        });
        const userId = user?.id;

        // 2. Fetch the device
        const device = await prisma.device.findUnique({
            where: { id: deviceId, departmentId },
            include: { product: true }
        });

        if (!device) {
            return { success: false, error: "Device not found" };
        }

        // 3. Calculate m, b, or segments
        let newMetricConfig: any = {};
        
        if (points.length === 1) {
            // 1-point offset calibration
            newMetricConfig = { m: 1, b: points[0].reference - points[0].raw };
        } else if (points.length >= 2) {
            // 2+ point piecewise slope/offset calibration
            const sortedPoints = [...points].sort((a, b) => a.reference - b.reference);
            const segments = [];
            for (let i = 0; i < sortedPoints.length - 1; i++) {
                const p1 = sortedPoints[i];
                const p2 = sortedPoints[i + 1];
                const deltaRaw = p2.raw - p1.raw;
                if (deltaRaw === 0) {
                    return { success: false, error: "Raw values cannot be identical for different reference points." };
                }
                const m = (p2.reference - p1.reference) / deltaRaw;
                const b = p1.reference - (m * p1.raw);
                
                const isLastSegment = i === sortedPoints.length - 2;
                segments.push({
                    m,
                    b,
                    rawBoundary: isLastSegment ? null : p2.raw,
                    operator: p1.raw > p2.raw ? '>' : '<'
                });
            }
            newMetricConfig = { segments };
        } else {
            return { success: false, error: "Invalid calibration points" };
        }

        // 4. Update the device's calibrationConfig
        const oldConfig = (device.calibrationConfig as Record<string, any>) || {};
        const newConfig = {
            ...oldConfig,
            [metric]: newMetricConfig
        };

        const now = new Date();
        const validUntil = new Date();
        validUntil.setDate(now.getDate() + 30); // Default to 30 days, could be read from dictionary

        await prisma.device.update({
            where: { id: deviceId },
            data: {
                calibrationConfig: newConfig,
                lastCalibrated: now,
                calibrationDueDate: validUntil
            }
        });

        // 5. Create Calibration Record
        await prisma.calibrationRecord.create({
            data: {
                deviceId,
                userId,
                timestamp: now,
                calibratedAt: now,
                validUntil,
                performedBy: session.user.name || session.user.email || "Unknown User",
                pointsApplied: points as any,
                oldConfig: oldConfig[metric] || null,
                newConfig: newMetricConfig
            }
        });

        // 6. Push config to edge worker via MQTT
        const { publishMQTTMessage } = await import('@/lib/core/mqtt');
        await publishMQTTMessage(`cmd/devices/${deviceId}/config`, {
            calibrationConfig: newConfig
        });

        return { success: true, config: newMetricConfig };
    } catch (error: any) {
        console.error("Failed to calibrate device:", error);
        return { success: false, error: error.message || "Failed to apply calibration" };
    }
}

export async function getDeviceDetailsAction(deviceId: string) {
    try {
        if (!deviceId) return { success: false, error: "Device ID is required" };

        const departmentId = await getDepartmentIdOrThrow();

        const device = await prisma.device.findFirst({
            where: { id: deviceId, departmentId },
            include: {
                product: true,
                calibrations: {
                    include: { user: true },
                    orderBy: { calibratedAt: 'desc' }
                },
                alerts: {
                    include: { experiment: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!device) {
            return { success: false, error: "Device not found" };
        }

        return { success: true, data: device };
    } catch (error: any) {
        console.error("Failed to fetch device details:", error);
        return { success: false, error: error.message || "Failed to fetch device details" };
    }
}
