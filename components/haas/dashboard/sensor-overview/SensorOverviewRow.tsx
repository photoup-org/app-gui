import DashboardRow from "../DashboardRow"
import AlertSummary from "./AlertSummary"
import CalibrationSummary from "./CalibrationSummary"
import InventorySummary from "./InventorySummary"
import { getInventoryStatus, getCalibrationList, getAlertsSummary } from "@/lib/data/maintenance"
import { getAppSession } from "@/lib/auth/session"
import { getUserWorkspaceContext } from "@/lib/services/workspace"

interface SensorOverviewRowProps {
    calibrationPage?: number;
}

const SensorOverviewRow = async ({ calibrationPage = 1 }: SensorOverviewRowProps) => {
    const session = await getAppSession();
    if (!session?.user) return null;

    const userContext = await getUserWorkspaceContext(session.user.sub);
    if (!userContext?.department) return null;

    const departmentId = userContext.department.id;

    const [inventoryData, calibrationData, alertsData] = await Promise.all([
        getInventoryStatus(departmentId),
        getCalibrationList(departmentId, calibrationPage, 5), // exactly 5 items per visual design
        getAlertsSummary(departmentId, 15), // last 15 days
    ]);

    return (
        <DashboardRow className="h-80">
            <InventorySummary data={inventoryData} />
            <CalibrationSummary data={calibrationData} />
            <AlertSummary data={alertsData} />
        </DashboardRow>
    )
}

export default SensorOverviewRow