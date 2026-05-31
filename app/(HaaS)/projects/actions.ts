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
