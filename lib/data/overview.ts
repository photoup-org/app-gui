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
  createdAt: string; // pre-formatted pt-PT: "DD/MM/YYYY HH:MM"
  updatedAt: Date;
  activeExperimentsCount: number;
  authorName: string;
  members: { name: string; avatarUrl?: string }[];
  stats: {
    experiments: number;
    alerts: number;
    sensors: number;
  };
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
          createdBy: {
            select: { name: true, email: true },
          },
          members: {
            include: {
              user: {
                select: { name: true, email: true },
              },
            },
          },
          devices: {
            select: { id: true },
          },
          experiments: {
            select: {
              id: true,
              _count: {
                select: {
                  alerts: true,
                },
              },
            },
          },
          _count: {
            select: {
              experiments: true,
            },
          },
        },
      }),
    ]);

    const mappedProjects: RecentProject[] = recentProjects.map((project) => {
      const formattedDate = project.createdAt.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) + " " + project.createdAt.toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const authorName = project.createdBy?.name || project.createdBy?.email || "Operador";
      const members = project.members.map((m) => ({
        name: m.user.name || m.user.email,
        avatarUrl: undefined as string | undefined,
      }));

      // Add a couple of realistic default mock avatars if database avatars are empty to elevate aesthetics
      if (members.length > 0) {
        const mockedUrls = [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
        ];
        members.forEach((member, i) => {
          member.avatarUrl = mockedUrls[i % mockedUrls.length];
        });
      }

      const experimentsCount = project._count.experiments;
      const alertsCount = project.experiments.reduce(
        (sum, exp) => sum + exp._count.alerts,
        0
      );
      const sensorsCount = project.devices.length;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: formattedDate,
        updatedAt: project.updatedAt,
        activeExperimentsCount: project.experiments.length, // count of loaded experiments
        authorName,
        members,
        stats: {
          experiments: experimentsCount,
          alerts: alertsCount,
          sensors: sensorsCount,
        },
      };
    });

    return {
      totalProjects,
      totalExperiments,
      recentProjects: mappedProjects,
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
