import prisma from "@/lib/prisma";
import { DeviceStatus, AlertSeverity, CalibrationRecord } from "@prisma/client";
import { DeviceWithProduct } from "@/lib/data/overview";

import { SENSOR_CALIBRATION_DICTIONARY } from "@/lib/sensor-schemas";

export interface MappedCalibrationDevice {
  id: string;
  serialNumber: string;
  status: DeviceStatus;
  productName: string;
  productSku: string;
  productSubtitle: string;
  lastCalibrated: Date | null;
  calibrationDueDate: Date | null;
  operator: string;
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
        experiments: {
          where: { status: 'RUNNING' },
          select: { id: true }
        }
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
 * Returns a paginated list of non-gateway sensors that require calibration.
 */
export async function getCalibrationList(
  departmentId: string,
  page: number = 1,
  take: number = 3,
  statusFilter?: string
): Promise<CalibrationListResponse> {
  const skip = (page - 1) * take;

  try {
    // 1. Fetch ALL sensors (not gateways) for the department
    const allSensors = await prisma.device.findMany({
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
          orderBy: { calibratedAt: 'desc' },
          take: 1,
          include: { user: true }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 2. Filter in memory to only include devices that support calibration
    let calibratableSensors = allSensors.filter(
      (device) => !!SENSOR_CALIBRATION_DICTIONARY[device.product.sku]
    );

    // 3. Apply status filter
    const now = new Date();
    if (statusFilter === 'VALID') {
      calibratableSensors = calibratableSensors.filter(d => d.calibrationDueDate && d.calibrationDueDate > now);
    } else if (statusFilter === 'OVERDUE') {
      calibratableSensors = calibratableSensors.filter(d => d.calibrationDueDate && d.calibrationDueDate < now);
    } else if (statusFilter === 'PENDING') {
      calibratableSensors = calibratableSensors.filter(d => !d.lastCalibrated);
    }

    // 4. Manually paginate the filtered results
    const total = calibratableSensors.length;
    const paginatedSensors = calibratableSensors.slice(skip, skip + take);

    const mappedDevices: MappedCalibrationDevice[] = paginatedSensors.map((device) => {
      const recentCalibration = device.calibrations[0];
      const operator = recentCalibration?.user?.name || recentCalibration?.performedBy || "N/A";

      return {
        id: device.id,
        serialNumber: device.serialNumber,
        status: device.status,
        productName: device.product.name,
        productSku: device.product.sku,
        productSubtitle: device.product.subtitle,
        lastCalibrated: device.lastCalibrated,
        calibrationDueDate: device.calibrationDueDate,
        operator
      };
    });

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
