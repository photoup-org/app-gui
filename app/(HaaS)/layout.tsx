import DashboardShell from "@/components/haas/DashboardShell";
import { getAppSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/services/workspace";
import { AppProvider, AppState } from "@/contexts/AppContext";
import { redirect } from "next/navigation";

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

  if (!userContext) {
    // If the user doesn't exist in our DB yet, force a logout/re-sync
    redirect("/auth/logout");
  }

  // Map the heavy Prisma object into our lean AppState for the client context
  const initialState: AppState = {
    user: {
      id: userContext.id,
      name: userContext.name,
      email: userContext.email,
    },
    workspace: {
      departmentId: userContext.departmentId,
      role: userContext.role,
      planName: userContext.department.plan?.name || null,
      labProfile: userContext.department.labProfile,
    },
  };

  return (
    <AppProvider initialState={initialState}>
      {children}
    </AppProvider>
  );
}
