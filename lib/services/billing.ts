import prisma from "@/lib/prisma";

export type PlanUsageStats = {
  planName: string;
  isTopTier: boolean;
  users: {
    used: number;
    limit: number | null;
  };
  sensors: {
    used: number;
    limit: number | null;
  };
};

/**
 * Pure utility function to calculate a department's usage stats from a pre-fetched department object.
 * Expects the department object to have 'plan' and '_count' (with users and devices) included.
 */
export function getPlanUsageStats(department: any): PlanUsageStats {
  const { plan, _count } = department;

  if (!plan) {
    return {
      planName: "Nenhum Plano",
      isTopTier: false,
      users: { used: 0, limit: 0 },
      sensors: { used: 0, limit: 0 },
    };
  }

  // Aggregate usage using Prisma _count (already fetched in getUserWorkspaceContext)
  const usersUsed = _count?.users || 0;
  const sensorsUsed = _count?.devices || 0;

  // Plan limits
  const isTopTier = plan.name.toLowerCase() === "executivo";

  return {
    planName: plan.name,
    isTopTier,
    users: {
      used: usersUsed,
      limit: plan.maxUsers,
    },
    sensors: {
      used: sensorsUsed,
      limit: plan.maxSensors,
    },
  };
}

