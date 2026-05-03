"use server";

import { getAppSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LabProfile } from "@prisma/client";

/**
 * Server Action to set the user's lab profile during onboarding.
 * 
 * @param profile The selected lab profile ('CONTINUOUS' or 'PROJECTS')
 */
export async function setLabProfile(profile: LabProfile) {
    const session = await getAppSession();
    
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    // Find the user and their department
    const user = await prisma.user.findUnique({
        where: { auth0UserId: session.user.sub },
        select: { departmentId: true }
    });

    if (!user || !user.departmentId) {
        throw new Error("User or Department not found");
    }

    // Update the department's lab profile
    await prisma.department.update({
        where: { id: user.departmentId },
        data: { labProfile: profile }
    });

    // Revalidate the dashboard path to trigger the state machine logic
    revalidatePath("/dashboard");
    
    return { success: true };
}
