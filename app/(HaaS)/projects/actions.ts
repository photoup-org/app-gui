"use server";

import prisma from "@/lib/prisma";

export async function getExperimentsByProjectIdAction(projectId: string) {
    try {
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
