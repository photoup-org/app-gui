import { getAppSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/services/workspace";
import { redirect } from "next/navigation";
import { hasRequiredRole } from "@/lib/auth/permissions";
import { Role } from "@prisma/client";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { HardwarePendingScreen } from "@/components/dashboard/HardwarePendingScreen";
import { ProjectsDashboard } from "@/components/dashboard/ProjectsDashboard";
import DashboardShell from "@/components/haas/DashboardShell";

export default async function Page() {
    const session = await getAppSession();

    // Middleware should catch this, but safeguard anyway
    if (!session?.user) {
        redirect("/");
    }

    // Fetch the aggregated workspace context from the DAL
    // Next.js 15 / React cache will deduplicate this if called in the layout as well
    const userContext = await getUserWorkspaceContext(session.user.sub);

    if (!userContext) {
        console.log("User not found in DB but is authenticated");
        redirect("/auth/logout");
    }

    // Role-based access control (RBAC) - Ensure minimum OPERATOR role for dashboard access
    if (!hasRequiredRole(userContext.role, Role.OPERATOR)) {
        redirect("/auth/logout");
    }

    const { department } = userContext;
    const labProfile = department.labProfile;
    const deviceCount = department._count.devices;
    const latestOrder = department.orders[0] || null;

    // --- Onboarding State Machine (Server-Side) ---

    // State 1: Pick a Lab Profile (First-time login)
    if (!labProfile) {
        return <WelcomeScreen />;
    }

    // State 2: Hardware Pending (No devices registered to department yet)
    if (deviceCount === 0) {
        return <HardwarePendingScreen latestOrder={latestOrder} />;
    }

    // State 3: Active Dashboard
    return (
        <DashboardShell>
            <ProjectsDashboard />
        </DashboardShell>
    );
}
