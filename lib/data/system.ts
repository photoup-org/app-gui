import prisma from "@/lib/prisma";
import { User, SystemLog } from "@prisma/client";

export interface SystemLogWithUser extends SystemLog {
  user: User | null;
}

export interface RecentLogsResponse {
  logs: SystemLogWithUser[];
  total: number;
}

export interface TeamSummaryResponse {
  members: User[];
  currentCount: number;
  maxAllowed: number | null;
}

/**
 * Objective: Check if the department has at least one active Gateway to allow network testing.
 * Query: Use prisma.device.findFirst({ where: { departmentId, product: { type: 'GATEWAY' } } }).
 * Transform: Return a boolean true if a gateway is found, false otherwise.
 */
export async function checkNetworkReadiness(departmentId: string): Promise<boolean> {
  try {
    const gateway = await prisma.device.findFirst({
      where: {
        departmentId,
        product: {
          type: "GATEWAY",
        },
      },
    });

    return gateway !== null;
  } catch (error) {
    console.error("Error in checkNetworkReadiness:", error);
    return false;
  }
}

/**
 * Objective: Fetch the most recent system audit logs.
 * Query: prisma.systemLog.findMany filtering by departmentId.
 * Includes: Include the related user (to get their name/email if applicable).
 * Order: Order by createdAt: 'desc'.
 * Limit: Limit the results using the take parameter.
 * Transform: Return the array of logs along with a total count (prisma.systemLog.count).
 */
export async function getRecentLogs(
  departmentId: string,
  take: number = 5
): Promise<RecentLogsResponse> {
  try {
    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where: {
          departmentId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take,
      }),
      prisma.systemLog.count({
        where: {
          departmentId,
        },
      }),
    ]);

    return {
      logs,
      total,
    };
  } catch (error) {
    console.error("Error in getRecentLogs:", error);
    return {
      logs: [],
      total: 0,
    };
  }
}

/**
 * Objective: Fetch team members and calculate plan limits.
 * Query 1: Fetch the users: prisma.user.findMany({ where: { departmentId }, orderBy: { createdAt: 'asc' } }).
 * Query 2: Fetch the department's plan limit: prisma.department.findUnique({ where: { id: departmentId }, include: { plan: { select: { maxUsers: true } } } }).
 * Transform:
 *   - Calculate currentCount = users.length.
 *   - Extract maxAllowed = department?.plan?.maxUsers ?? null. (If null, it means unlimited).
 *   - Return { members: User[], currentCount: number, maxAllowed: number | null }.
 */
export async function getTeamSummary(departmentId: string): Promise<TeamSummaryResponse> {
  try {
    const [users, department] = await Promise.all([
      prisma.user.findMany({
        where: {
          departmentId,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
      prisma.department.findUnique({
        where: {
          id: departmentId,
        },
        include: {
          plan: {
            select: {
              maxUsers: true,
            },
          },
        },
      }),
    ]);

    const currentCount = users.length;
    const maxAllowed = department?.plan?.maxUsers ?? null;

    return {
      members: users,
      currentCount,
      maxAllowed,
    };
  } catch (error) {
    console.error("Error in getTeamSummary:", error);
    return {
      members: [],
      currentCount: 0,
      maxAllowed: null,
    };
  }
}
