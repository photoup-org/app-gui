import { checkNetworkReadiness, getRecentLogs, getTeamSummary } from "@/lib/data/system";
import { getAppSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/services/workspace";
import { NetworkTestWidget } from "./NetworkTestWidget";
import { SystemLogsWidget } from "./SystemLogsWidget";
import { TeamSummaryWidget } from "./TeamSummaryWidget";
import DashboardRow from "../DashboardRow";

export async function SystemAdminRow() {
  const session = await getAppSession();
  if (!session?.user) return null;

  const userContext = await getUserWorkspaceContext(session.user.sub);
  if (!userContext?.department) return null;

  const departmentId = userContext.department.id;

  const [isNetworkReady, logsData, teamData] = await Promise.all([
    checkNetworkReadiness(departmentId),
    getRecentLogs(departmentId, 5),
    getTeamSummary(departmentId),
  ]);

  return (
    <DashboardRow className="h-72">
      <NetworkTestWidget isReady={isNetworkReady} />
      <SystemLogsWidget data={logsData} />
      <TeamSummaryWidget data={teamData} />
    </DashboardRow>

  );
}
