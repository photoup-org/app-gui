import prisma from "@/lib/prisma";

export type PlanUsageStats = {
  planName: string;
  isTopTier: boolean;
  gateways: {
    used: number;
    limit: number | null;
  };
  sensors: {
    used: number;
    limit: number | null;
  };
};

/**
 * DAL function to aggregate a department's hardware usage against their plan limits.
 * Fetches data directly from Prisma (Server Component pattern).
 */
export async function getPlanUsageStats(departmentId: string): Promise<PlanUsageStats> {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      plan: true,
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

  const { plan, devices } = department;

  if (!plan) {
    return {
      planName: "Nenhum Plano",
      isTopTier: false,
      gateways: { used: 0, limit: 0 },
      sensors: { used: 0, limit: 0 },
    };
  }

  // Aggregate usage by hardware type
  // GATEWAY devices
  const gatewaysUsed = devices.filter((d) => d.product.type === "GATEWAY").length;
  
  // SENSOR_BASE and SENSOR_PREMIUM are both counted as sensors
  const sensorsUsed = devices.filter(
    (d) => d.product.type === "SENSOR_BASE" || d.product.type === "SENSOR_PREMIUM"
  ).length;

  // Plan limits
  // NOTE: Based on the prompt instructions, we use includedGateways and includedSensors.
  // We check if it's the top tier 'Executivo' to potentially treat limits as unlimited (null)
  const isTopTier = plan.name.toLowerCase() === "executivo";

  return {
    planName: plan.name,
    isTopTier,
    gateways: {
      used: gatewaysUsed,
      limit: plan.includedGateways,
    },
    sensors: {
      used: sensorsUsed,
      limit: plan.includedSensors,
    },
  };
}
