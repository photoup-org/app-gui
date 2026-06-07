import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import prisma from '@/lib/core/prisma';

export async function getFleetHealthSummary(tenantId: string) {
  try {
    const devices = await prisma.device.groupBy({
      by: ['status'],
      where: {
        departmentId: tenantId,
      },
      _count: {
        id: true,
      },
    });

    return devices.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);
  } catch (error) {
    console.error("Error in getFleetHealthSummary:", error);
    return { error: "Failed to fetch fleet health summary." };
  }
}

export async function getCurrentBillingTier(tenantId: string) {
  try {
    const department = await prisma.department.findUnique({
      where: { id: tenantId },
      include: {
        plan: true,
        _count: {
          select: { devices: true }
        }
      }
    });

    if (!department) {
      return { error: "Tenant not found." };
    }
    
    if (!department.plan) {
      return { 
        status: department.subStatus,
        message: "No active billing plan assigned." 
      };
    }

    return {
      planName: department.plan.name,
      maxSensors: department.plan.maxSensors,
      currentSensors: department._count.devices,
      status: department.subStatus,
      priceAmount: department.plan.priceAmount,
      currency: department.plan.currency
    };
  } catch (error) {
    console.error("Error in getCurrentBillingTier:", error);
    return { error: "Failed to fetch billing tier." };
  }
}

export async function getFleetDevices(tenantId: string, status?: string) {
  try {
    const whereClause: any = { departmentId: tenantId };
    if (status) {
      whereClause.status = status.toUpperCase();
    }
    const devices = await prisma.device.findMany({
      where: whereClause,
      select: {
        serialNumber: true,
        name: true,
        status: true,
        product: { select: { name: true, type: true } }
      }
    });
    return devices.map(d => ({
      serialNumber: d.serialNumber,
      assetName: d.name,
      status: d.status,
      product: d.product?.name,
      productType: d.product?.type
    }));
  } catch (error) {
    console.error("Error in getFleetDevices:", error);
    return { error: "Failed to fetch fleet devices. Check if status parameter is valid." };
  }
}

export async function getProjectAndExperimentDetails(tenantId: string, searchString: string) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        departmentId: tenantId,
        OR: [
          { name: { contains: searchString, mode: 'insensitive' } },
          { experiments: { some: { name: { contains: searchString, mode: 'insensitive' } } } }
        ]
      },
      include: {
        experiments: {
          include: { devices: { select: { serialNumber: true } } }
        }
      }
    });
    
    return projects.map(p => ({
      projectName: p.name,
      status: p.status,
      experiments: p.experiments.map(e => ({
        experimentName: e.name,
        status: e.status,
        startDate: e.startDate,
        endDate: e.endDate,
        assignedDevices: e.devices.map(d => d.serialNumber)
      }))
    }));
  } catch (error) {
    console.error("Error in getProjectAndExperimentDetails:", error);
    return { error: "Failed to fetch project details." };
  }
}

export async function getRecentSystemAlerts(tenantId: string, limit: number = 10) {
  try {
    const alerts = await prisma.alert.findMany({
      where: { departmentId: tenantId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit) || 10,
      include: { device: { select: { serialNumber: true } } }
    });
    return alerts.map(a => ({
      timestamp: a.createdAt,
      serialNumber: a.device?.serialNumber || null,
      severity: a.severity,
      message: a.message || a.title
    }));
  } catch (error) {
    console.error("Error in getRecentSystemAlerts:", error);
    return { error: "Failed to fetch recent system alerts." };
  }
}

export async function getDeviceCalibrationAudit(tenantId: string, serialNumber: string) {
  try {
    const device = await prisma.device.findFirst({
      where: { departmentId: tenantId, serialNumber }
    });
    if (!device) return { error: "Device not found in your organization." };

    const calibrations = await prisma.calibrationRecord.findMany({
      where: { deviceId: device.id },
      orderBy: { calibratedAt: 'desc' },
      take: 5
    });

    return calibrations.map(c => ({
      calibratedAt: c.calibratedAt,
      performedBy: c.performedBy,
      pointsApplied: c.pointsApplied,
      newConfig: c.newConfig
    }));
  } catch (error) {
    console.error("Error in getDeviceCalibrationAudit:", error);
    return { error: "Failed to fetch device calibration audit." };
  }
}


export const haasFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: 'getFleetHealthSummary',
    description: 'Retrieves a summary of the hardware fleet health. Returns counts of devices grouped by their current status (e.g., ACTIVE, MAINTENANCE, OFFLINE). Always use this to get up-to-date counts of device statuses.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getCurrentBillingTier',
    description: 'Retrieves the active HaaS subscription tier and current monthly usage for the organization, including their plan name, sensor limits, current sensor count, and subscription status. Use this to answer questions about billing, plans, limits, and costs.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getFleetDevices',
    description: 'Queries the device inventory for the organization. Returns the serial number, asset name, operational status, and associated hardware product metadata. Can optionally filter by status (e.g., ACTIVE, MAINTENANCE, OFFLINE, PENDING_CONNECTION).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        status: {
          type: SchemaType.STRING,
          description: 'Optional status filter (e.g., ACTIVE, MAINTENANCE, OFFLINE, PENDING_CONNECTION)',
        },
      },
    },
  },
  {
    name: 'getProjectAndExperimentDetails',
    description: 'Searches for projects or specific microalgae cultivation batches/experiments matching the query string. Returns project parameters, running status, start/end dates, and a list of assigned hardware tracking IDs.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        searchString: {
          type: SchemaType.STRING,
          description: 'The search string to find projects or experiments by name',
        },
      },
      required: ['searchString'],
    },
  },
  {
    name: 'getRecentSystemAlerts',
    description: 'Fetches the latest system incidents, threshold violations, and alerts. Returns timestamps, associated device serial numbers, alert severity levels, and descriptive messages.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        limit: {
          type: SchemaType.NUMBER,
          description: 'The maximum number of alerts to return (default: 10)',
        },
      },
    },
  },
  {
    name: 'getDeviceCalibrationAudit',
    description: 'Queries the calibration record history for a given device serial number to ensure GLP compliance. Returns calculated piece-wise coefficients, raw versus reference point metrics, and the timestamp of the last intervention.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        serialNumber: {
          type: SchemaType.STRING,
          description: 'The serial number of the hardware device to audit',
        },
      },
      required: ['serialNumber'],
    },
  }
];

export const tools = {
  getFleetHealthSummary,
  getCurrentBillingTier,
  getFleetDevices,
  getProjectAndExperimentDetails,
  getRecentSystemAlerts,
  getDeviceCalibrationAudit
};
