"use server";

import prisma from "@/lib/prisma";

export async function getLoginUrlByEmail(formData: FormData) {
    const email = formData.get("email")?.toString().trim();

    if (!email) {
        return { error: "Please provide a valid email address." };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { department: { include: { organization: true } } }
        });

        if (!user || !user.department?.organization?.auth0OrgId) {
            return { error: "Invalid email or account not found" };
        }

        // Since proxy.ts uses /auth/login, we use that path here.
        return { redirectUrl: `/auth/login?organization=${user.department.organization.auth0OrgId}` };
    } catch (error) {
        console.error("[AuthAction] Error looking up user by email:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
}
