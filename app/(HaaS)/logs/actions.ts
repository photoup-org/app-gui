"use server";

import { getAppSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/services/workspace";
import prisma from "@/lib/prisma";
import { SystemLog, User, Prisma } from "@prisma/client";

export interface SystemLogWithUser extends SystemLog {
  user: User | null;
}

/**
 * Validates the user session and returns the departmentId.
 * Throws an error if unauthorized.
 */
async function getDepartmentIdOrThrow(): Promise<string> {
  const session = await getAppSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userContext = await getUserWorkspaceContext(session.user.sub);
  if (!userContext?.department) {
    throw new Error("Department context missing");
  }

  return userContext.department.id;
}

/**
 * Fetches recent system logs, excluding alerts.
 */
export async function getRecentLogsAction(
  limit: number = 50
): Promise<{ logs: SystemLogWithUser[]; total: number }> {
  try {
    const departmentId = await getDepartmentIdOrThrow();

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where: {
          departmentId,
          category: {
            not: "ALERT",
          },
        },
        include: {
          user: true,
        },
        orderBy: {
          timestamp: "desc",
        },
        take: limit,
      }),
      prisma.systemLog.count({
        where: {
          departmentId,
          category: {
            not: "ALERT",
          },
        },
      }),
    ]);

    return { logs, total };
  } catch (error) {
    console.error("Error in getRecentLogsAction:", error);
    return { logs: [], total: 0 };
  }
}

/**
 * Fetches recent alerts (category = ALERT or level = ERROR/CRITICAL).
 */
export async function getRecentAlertsAction(
  days: number = 5
): Promise<{ alerts: SystemLogWithUser[]; total: number }> {
  try {
    const departmentId = await getDepartmentIdOrThrow();

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const whereClause: Prisma.SystemLogWhereInput = {
      departmentId,
      timestamp: { gte: dateThreshold },
      OR: [
        { category: "ALERT" },
        { level: { in: ["ERROR", "CRITICAL"] } },
      ],
    };

    const [alerts, total] = await Promise.all([
      prisma.systemLog.findMany({
        where: whereClause,
        include: {
          user: true,
        },
        orderBy: {
          timestamp: "desc",
        },
      }),
      prisma.systemLog.count({
        where: whereClause,
      }),
    ]);

    return { alerts, total };
  } catch (error) {
    console.error("Error in getRecentAlertsAction:", error);
    return { alerts: [], total: 0 };
  }
}

/**
 * Fetches all incident logs with pagination and filtering.
 */
export async function getAllIncidentLogsAction(
  filters?: {
    category?: string;
    level?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ logs: SystemLogWithUser[]; total: number }> {
  try {
    const departmentId = await getDepartmentIdOrThrow();

    const whereClause: any = {
      departmentId,
    };

    if (filters?.category) {
      whereClause.category = filters.category;
    }

    if (filters?.level) {
      whereClause.level = filters.level;
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where: whereClause,
        include: {
          user: true,
        },
        orderBy: {
          timestamp: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.systemLog.count({
        where: whereClause,
      }),
    ]);

    return { logs, total };
  } catch (error) {
    console.error("Error in getAllIncidentLogsAction:", error);
    return { logs: [], total: 0 };
  }
}
