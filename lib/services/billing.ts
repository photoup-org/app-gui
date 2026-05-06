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
 * DAL function to aggregate a department's hardware and user usage against their plan limits.
 * Fetches data directly from Prisma (Server Component pattern).
 */
export async function getPlanUsageStats(departmentId: string): Promise<PlanUsageStats> {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      plan: true,
      users: {
        select: { id: true },
      },
      devices: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!department) {
    throw new Error(`Department with ID ${departmentId} not found`);
  }

  const { plan, devices, users } = department;

  if (!plan) {
    return {
      planName: "Nenhum Plano",
      isTopTier: false,
      users: { used: 0, limit: 0 },
      sensors: { used: 0, limit: 0 },
    };
  }

  // Aggregate usage
  const usersUsed = users.length;
  
  // SENSOR_BASE and SENSOR_PREMIUM are both counted as sensors
  const sensorsUsed = devices.filter(
    (d) => d.product.type === "SENSOR_BASE" || d.product.type === "SENSOR_PREMIUM"
  ).length;

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
