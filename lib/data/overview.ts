import prisma from "@/lib/prisma";
import { Device, HardwareProduct, DeviceStatus } from "@prisma/client";

export type DeviceWithProduct = Device & { product: HardwareProduct };

export interface SensorSummary {
  active: DeviceWithProduct[];
  offline: DeviceWithProduct[];
  maintenance: DeviceWithProduct[];
  unclaimed: DeviceWithProduct[];
}

export async function getSensorSummary(departmentId: string): Promise<SensorSummary> {
  const summary: SensorSummary = {
    active: [],
    offline: [],
    maintenance: [],
    unclaimed: [],
  };

  try {
    const devices = await prisma.device.findMany({
      where: {
        departmentId,
        product: { type: { not: "GATEWAY" } },
      },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    for (const device of devices) {
      if (device.status === DeviceStatus.ACTIVE) summary.active.push(device);
      else if (device.status === DeviceStatus.OFFLINE) summary.offline.push(device);
      else if (device.status === DeviceStatus.MAINTENANCE) summary.maintenance.push(device);
      else if (device.status === DeviceStatus.UNCLAIMED) summary.unclaimed.push(device);
    }

    return summary;
  } catch (error) {
    console.error("Error fetching sensor summary:", error);
    return summary;
  }
}

export interface RecentProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  activeExperimentsCount: number;
}

export interface ProjectSummary {
  totalProjects: number;
  totalExperiments: number;
  recentProjects: RecentProject[];
}

export async function getProjectSummary(departmentId: string): Promise<ProjectSummary> {
  try {
    const [totalProjects, totalExperiments, recentProjects] = await Promise.all([
      prisma.project.count({ where: { departmentId } }),
      prisma.experiment.count({ where: { project: { departmentId } } }),
      prisma.project.findMany({
        where: { departmentId },
        orderBy: { updatedAt: "desc" },
        take: 3,
        include: {
          _count: {
            select: {
              experiments: {
                where: { status: "RUNNING" },
              },
            },
          },
        },
      }),
    ]);

    return {
      totalProjects,
      totalExperiments,
      recentProjects: recentProjects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        activeExperimentsCount: project._count.experiments,
      })),
    };
  } catch (error) {
    console.error("Error fetching project summary:", error);
    return {
      totalProjects: 0,
      totalExperiments: 0,
      recentProjects: [],
    };
  }
}

export interface GatewaySummary {
  id: string;
  serialNumber: string;
  status: string;
  signalStrength: number;
  totalActiveNetworkSensors: number;
}

export async function getGatewaysSummary(departmentId: string): Promise<GatewaySummary[]> {
  try {
    // Evaluate the overall network load
    const totalActiveNetworkSensors = await prisma.device.count({
      where: {
        departmentId,
        status: "ACTIVE",
        product: { type: { not: "GATEWAY" } },
      },
    });

    const gateways = await prisma.device.findMany({
      where: {
        departmentId,
        product: { type: "GATEWAY" },
      },
      include: {
        readings: {
          where: { metricType: "rssi" },
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
    });

    return gateways.map((gateway) => {
      let signalStrength = 0;
      if (gateway.status !== "OFFLINE" && gateway.readings.length > 0) {
        signalStrength = gateway.readings[0].value;
      }

      return {
        id: gateway.id,
        serialNumber: gateway.serialNumber,
        status: gateway.status,
        signalStrength,
        totalActiveNetworkSensors,
      };
    });
  } catch (error) {
    console.error("Error fetching gateways summary:", error);
    return [];
  }
}
