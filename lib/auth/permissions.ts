import { Role, PlanTier } from "@prisma/client";

// Define hierarchy levels for comparison
const ROLE_HIERARCHY: Record<Role, number> = {
    VIEWER: 0,
    OPERATOR: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
};

const PLAN_HIERARCHY: Record<PlanTier, number> = {
    STARTER: 0,
    INDUSTRIAL_PRO: 1,
    EXECUTIVE: 2,
};

/**
 * Checks if a user has the required role or higher.
 * SUPER_ADMIN always returns true.
 */
export function hasRequiredRole(userRole: Role | undefined | null | string, requiredRole: Role): boolean {
    if (!userRole) return false;
    if (userRole === "SUPER_ADMIN") return true; // God mode bypass

    const userRoleEnum = userRole as Role;
    const userLevel = ROLE_HIERARCHY[userRoleEnum] ?? -1;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 999;

    return userLevel >= requiredLevel;
}

/**
 * Checks if an organization has the required plan or higher.
 * SUPER_ADMIN user role bypasses this check and always returns true.
 */
export function hasRequiredPlan(
    orgPlan: PlanTier | undefined | null | string,
    requiredPlan: PlanTier,
    userRole?: Role | null | string // Optional for God Mode bypass
): boolean {
    if (userRole === "SUPER_ADMIN") return true;

    if (!orgPlan) return false;

    const planEnum = orgPlan as PlanTier;
    const currentLevel = PLAN_HIERARCHY[planEnum] ?? -1;
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] ?? 999;

    return currentLevel >= requiredLevel;
}
