import DashboardRow from "../DashboardRow"
import AlertSummary from "./AlertSummary"
import CalibrationSummary from "./CalibrationSummary"
import InventorySummary from "./InventorySummary"
import { getInventoryStatus, getCalibrationList } from '@/lib/domain/maintenance'
import { getRecentAlertsAction } from "@/app/(HaaS)/logs/actions"
import { getAppSession } from '@/lib/core/auth/session'
import { getUserWorkspaceContext } from "@/lib/services/workspace"

interface SensorOverviewRowProps {
    calibrationPage?: number;
    calibrationFilter?: string;
}

const SensorOverviewRow = async ({ calibrationPage = 1, calibrationFilter }: SensorOverviewRowProps) => {
    const session = await getAppSession();
    if (!session?.user) return null;

    const userContext = await getUserWorkspaceContext(session.user.sub);
    if (!userContext?.department) return null;

    const departmentId = userContext.department.id;

    const [inventoryData, calibrationData, alertsData] = await Promise.all([
        getInventoryStatus(departmentId),
        getCalibrationList(departmentId, calibrationPage, 5, calibrationFilter), // exactly 5 items per visual design
        getRecentAlertsAction(24), 
    ]);

    return (
        <DashboardRow className="h-80">
            <InventorySummary devices={inventoryData} />
            <CalibrationSummary data={calibrationData} />
            <AlertSummary initialAlerts={alertsData} />
        </DashboardRow>
    )
}

export default SensorOverviewRow