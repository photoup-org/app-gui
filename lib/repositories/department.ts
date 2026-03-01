import prisma from '@/lib/prisma';
import { Department } from '@prisma/client';

export async function findDepartmentByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Department | null> {
    return prisma.department.findUnique({
        where: { stripeSubscriptionId }
    });
}

export async function updateDepartmentStatusByStripeSubscriptionId(stripeSubscriptionId: string, subStatus: any): Promise<void> {
    await prisma.department.updateMany({
        where: { stripeSubscriptionId },
        data: { subStatus }
    });
}

export async function updateDepartmentStatus(id: string, subStatus: any): Promise<Department> {
    return prisma.department.update({
        where: { id },
        data: { subStatus }
    });
}

export async function updateDepartmentAuth0OrgId(id: string, auth0OrgId: string): Promise<Department> {
    return prisma.department.update({
        where: { id },
        data: { auth0OrgId }
    });
}

export async function findDepartmentByAuth0OrgId(auth0OrgId: string): Promise<Department | null> {
    return prisma.department.findUnique({
        where: { auth0OrgId }
    });
}
