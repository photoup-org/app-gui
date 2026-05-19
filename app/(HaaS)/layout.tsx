import { getAppSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/services/workspace";
import { AppProvider, AppState } from "@/contexts/AppContext";
import { redirect } from "next/navigation";
import { WelcomeScreen } from "@/components/haas/dashboard/WelcomeScreen";
import { HardwarePendingScreen } from "@/components/haas/dashboard/HardwarePendingScreen";
import { hasRequiredRole } from "@/lib/auth/permissions";
import { Role } from "@prisma/client";
import AppTemplate from "@/components/haas/AppTemplate";
import { Suspense } from "react";
import { CreateProjectDialog } from "@/components/haas/projects/CreateProjectDialog";

import { getPlanUsageStats } from "@/lib/services/billing";
import prisma from "@/lib/prisma";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAppSession();

  // Safeguard: session should be handled by middleware, but we check anyway
  if (!session?.user) {
    redirect("/");
  }

  // Fetch the aggregated workspace context from the DAL
  const userContext = await getUserWorkspaceContext(session.user.sub);

  if (!userContext || !userContext.department) {
    // If the user doesn't exist in our DB yet, force a logout/re-sync
    redirect("/auth/logout");
  }

  // Role-based access control (RBAC) - Ensure minimum OPERATOR role for dashboard access
  if (!hasRequiredRole(userContext.role, Role.OPERATOR)) {
    redirect("/auth/logout");
  }

  // Calculate plan usage stats for the widget synchronously using the pre-fetched context
  const planStats = getPlanUsageStats(userContext.department);


  // Map the heavy Prisma object into our lean AppState for the client context
  const initialState: AppState = {
    user: {
      id: userContext.id,
      name: userContext.name,
      email: userContext.email,
      picture: session.user?.picture || "",
    },
    workspace: {
      organizationName: userContext.department.organization.name,
      departmentId: userContext.department.id,
      departmentName: userContext.department.name,
      role: userContext.role,
      planName: userContext.department.plan?.name || null,
      labProfile: userContext.department.labProfile,
      planStats,
      trackingNumber: (userContext.department.orders[0] as any)?.trackingNumber || null,

    },
  };


  const { department } = userContext;
  const labProfile = department.labProfile;
  const latestOrder = department.orders[0] || null;

  // Find if there is at least one Gateway that is NOT Unclaimed
  const claimedGatewayCount = await prisma.device.count({
    where: {
      departmentId: userContext.department.id,
      status: { not: "UNCLAIMED" }, // It must be OFFLINE, ACTIVE, or MAINTENANCE
      product: {
        type: "GATEWAY" // Strictly looking for a Gateway
      }
    }
  });

  const hasClaimedGateway = claimedGatewayCount > 0;

  // --- Onboarding State Machine (Server-Side) ---

  // State 1: Pick a Lab Profile (First-time login) - NO DashboardShell
  if (!labProfile) return <WelcomeScreen />


  return (
    <AppProvider initialState={initialState}>
      <AppTemplate>
        {hasClaimedGateway ? children : <HardwarePendingScreen latestOrder={latestOrder} />}
      </AppTemplate>
      <Suspense fallback={null}>
        <CreateProjectDialog />
      </Suspense>
    </AppProvider>
  );
}
