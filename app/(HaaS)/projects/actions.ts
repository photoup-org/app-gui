"use server";

import prisma from "@/lib/prisma";
import { getAppSession } from "@/lib/auth/session";

export async function getExperimentsByProjectIdAction(projectId: string) {
    try {
        const session = await getAppSession();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const experiments = await prisma.experiment.findMany({
            where: { projectId },
            orderBy: {
                startDate: 'desc'
            },
            include: {
                devices: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
        return { success: true, data: experiments };
    } catch (error) {
        console.error("Failed to fetch experiments by project ID:", error);
        return { success: false, error: "Failed to fetch experiments" };
    }
}

export async function getProjectEquipmentAction(projectId: string) {
    try {
        const session = await getAppSession();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const devices = await prisma.device.findMany({
            where: { projectId },
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
        console.error("Failed to fetch project equipment:", error);
        return { success: false, error: "Failed to fetch project equipment" };
    }
}

export async function getProjectAlertsAction(projectId: string) {
    try {
        const session = await getAppSession();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const experiments = await prisma.experiment.findMany({
            where: { projectId },
            select: { id: true, name: true }
        });
        
        const experimentIds = experiments.map(e => e.id);
        const experimentMap = new Map(experiments.map(e => [e.id, e.name]));

        const logs = await prisma.systemLog.findMany({
            where: {
                category: 'ALERT',
                experimentId: {
                    in: experimentIds
                }
            },
            orderBy: {
                timestamp: 'desc'
            }
        });

        const mappedAlerts = logs.map(log => ({
            id: log.id,
            severity: log.level,
            title: log.action,
            message: log.message,
            createdAt: log.timestamp,
            experiment: log.experimentId ? {
                id: log.experimentId,
                name: experimentMap.get(log.experimentId) || "Desconhecida"
            } : null
        }));

        return { success: true, data: mappedAlerts };
    } catch (error) {
        console.error("Failed to fetch project alerts:", error);
        return { success: false, error: "Failed to fetch project alerts" };
    }
}
