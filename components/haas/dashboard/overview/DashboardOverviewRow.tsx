import { DeviceSummaryWidget } from "./DeviceSummaryWidget";
import { ProjectSummaryWidget } from "./ProjectSummaryWidget";
import { GatewaySummaryWidget } from "./GatewaySummaryWidget";
import {
  getSensorSummary,
  getProjectSummary,
  getGatewaysSummary,
} from "@/lib/data/overview";
import { getAppSession } from "@/lib/auth/session";
import { getUserWorkspaceContext } from "@/lib/services/workspace";
import DashboardRow from "../DashboardRow";

export async function DashboardOverviewRow() {
  const session = await getAppSession();
  if (!session?.user) return null;

  const userContext = await getUserWorkspaceContext(session.user.sub);
  if (!userContext?.department) return null;

  const departmentId = userContext.department.id;

  const [sensorData, projectData, gatewaysData] = await Promise.all([
    getSensorSummary(departmentId),
    getProjectSummary(departmentId),
    getGatewaysSummary(departmentId),
  ]);

  return (
    <DashboardRow className="h-52">
      <DeviceSummaryWidget data={sensorData} />
      <ProjectSummaryWidget data={projectData} />
      <GatewaySummaryWidget gateways={gatewaysData} />
    </DashboardRow>
  );
}
