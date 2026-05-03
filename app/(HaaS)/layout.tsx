import { getAppSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/services/workspace";
import { AppProvider, AppState } from "@/contexts/AppContext";
import { redirect } from "next/navigation";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { HardwarePendingScreen } from "@/components/dashboard/HardwarePendingScreen";
import { hasRequiredRole } from "@/lib/auth/permissions";
import { Role } from "@prisma/client";
import AppTemplate from "@/components/haas/AppTemplate";

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
    },
  };

  const { department } = userContext;
  const labProfile = department.labProfile;
  const deviceCount = department._count.devices;
  const latestOrder = department.orders[0] || null;

  // --- Onboarding State Machine (Server-Side) ---

  // State 1: Pick a Lab Profile (First-time login) - NO DashboardShell
  if (!labProfile) return <WelcomeScreen />



  return (
    <AppProvider initialState={initialState}>
      <AppTemplate>
        {deviceCount === 0 ? <HardwarePendingScreen latestOrder={latestOrder} /> : children}
      </AppTemplate>
    </AppProvider>
  );
}
