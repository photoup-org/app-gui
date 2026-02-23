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
            include: { department: true }
        });

        if (!user || !user.department?.auth0OrgId) {
            return { error: "Invalid email or account not found" };
        }

        return { redirectUrl: `/auth/login?organization=${user.department.auth0OrgId}&returnTo=/dashboard` };
    } catch (error) {
        console.error("[AuthAction] Error looking up user by email:", error);
        return { error: "An unexpected error occurred. Please try again later." };
    }
}
