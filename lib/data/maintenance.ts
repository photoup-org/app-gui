import prisma from "@/lib/prisma";
import { DeviceStatus, AlertSeverity, CalibrationRecord } from "@prisma/client";
import { DeviceWithProduct } from "@/lib/data/overview";

export interface MappedCalibrationDevice {
  id: string;
  serialNumber: string;
  status: DeviceStatus;
  productName: string;
  productSku: string;
  productSubtitle: string;
  recentCalibration: CalibrationRecord | null;
}

export interface CalibrationListResponse {
  data: MappedCalibrationDevice[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface AlertsSummary {
  critical: number;
  warning: number;
  info: number;
  total: number;
}

/**
 * Returns the list of non-gateway devices for the department to evaluate dynamically in the client.
 */
export async function getInventoryStatus(departmentId: string): Promise<DeviceWithProduct[]> {
  try {
    const devices = await prisma.device.findMany({
      where: {
        departmentId,
        product: {
          type: {
            not: "GATEWAY",
          },
        },
      },
      include: {
        product: true,
      },
    });

    return devices.map((d) => ({
      ...d,
      product: {
        ...d.product,
        price: Number(d.product.price),
      },
    })) as DeviceWithProduct[];
  } catch (error) {
    console.error("Error fetching inventory status:", error);
    return [];
  }
}

/**
 * Returns a paginated list of non-gateway sensors along with their most recent calibration.
 */
export async function getCalibrationList(
  departmentId: string,
  page: number = 1,
  take: number = 3
): Promise<CalibrationListResponse> {
  const skip = (page - 1) * take;

  try {
    const [total, devices] = await Promise.all([
      prisma.device.count({
        where: {
          departmentId,
          product: {
            type: {
              not: "GATEWAY",
            },
          },
        },
      }),
      prisma.device.findMany({
        where: {
          departmentId,
          product: {
            type: {
              not: "GATEWAY",
            },
          },
        },
        include: {
          product: true,
          calibrations: {
            orderBy: {
              calibratedAt: "desc",
            },
            take: 1,
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const mappedDevices: MappedCalibrationDevice[] = devices.map((device) => ({
      id: device.id,
      serialNumber: device.serialNumber,
      status: device.status,
      productName: device.product.name,
      productSku: device.product.sku,
      productSubtitle: device.product.subtitle,
      recentCalibration: device.calibrations[0] || null,
    }));

    const totalPages = Math.ceil(total / take) || 1;

    return {
      data: mappedDevices,
      metadata: {
        total,
        page,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching calibration list:", error);
    return {
      data: [],
      metadata: {
        total: 0,
        page,
        totalPages: 1,
      },
    };
  }
}

/**
 * Returns the count of alerts grouped by severity over the specified timeframe.
 */
export async function getAlertsSummary(
  departmentId: string,
  daysAgo: number = 15
): Promise<AlertsSummary> {
  const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  try {
    const grouped = await prisma.alert.groupBy({
      by: ["severity"],
      where: {
        departmentId,
        createdAt: {
          gte: cutoffDate,
        },
      },
      _count: {
        severity: true,
      },
    });

    let critical = 0;
    let warning = 0;
    let info = 0;
    let total = 0;

    for (const group of grouped) {
      const count = group._count.severity || 0;
      total += count;

      if (group.severity === AlertSeverity.CRITICAL) {
        critical = count;
      } else if (group.severity === AlertSeverity.WARNING) {
        warning = count;
      } else if (group.severity === AlertSeverity.INFO) {
        info = count;
      }
    }

    return { critical, warning, info, total };
  } catch (error) {
    console.error("Error fetching alerts summary:", error);
    return { critical: 0, warning: 0, info: 0, total: 0 };
  }
}
