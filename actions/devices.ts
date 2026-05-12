"use server";

import { getAppSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Server Action to register a hardware device to a user's department.
 * 
 * @param serialNumber The serial number of the device to register
 */
export async function registerDeviceAction(serialNumber: string) {
    const session = await getAppSession();
    
    if (!session?.user) {
        return { success: false, error: "Não autorizado." };
    }

    // Get user's department ID
    const user = await prisma.user.findUnique({
        where: { auth0UserId: session.user.sub },
        select: { departmentId: true }
    });

    if (!user || !user.departmentId) {
        return { success: false, error: "Utilizador ou Departamento não encontrado." };
    }

    const userDeptId = user.departmentId;

    // 1. Query Prisma to find the device
    const device = await prisma.device.findUnique({
        where: { serialNumber }
    });

    // 2. Logic checks
    if (!device) {
        return { success: false, error: "Equipamento não encontrado." };
    }

    // Ownership check: must belong to the user's department
    if (device.departmentId !== userDeptId) {
        return { success: false, error: "Este equipamento não pertence à sua organização." };
    }

    // State check: must be UNCLAIMED
    if (device.status !== "UNCLAIMED") {
        return { success: false, error: "Este equipamento já foi registado." };
    }

    // 3. Update Prisma: Set status to OFFLINE (it becomes ACTIVE on first telemetry)
    await prisma.device.update({
        where: { id: device.id },
        data: { 
            status: "OFFLINE"
        }
    });

    // 4. Revalidate
    revalidatePath("/dashboard");
    
    return { success: true };
}
