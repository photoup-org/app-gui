import { ReactNode } from "react";
import { PlanTier, Role } from "@prisma/client";
import { hasRequiredPlan } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button"; // Assuming we have shadcn UI button, else standard button
import Link from "next/link";
import { Lock } from "lucide-react";

interface PlanGateProps {
    children: ReactNode;
    minimumPlan: PlanTier;
    currentPlan?: PlanTier | string | null;
    userRole?: Role | string | null; // Needed for God Mode bypass
}

export const PlanGate = ({
    children,
    minimumPlan,
    currentPlan,
    userRole
}: PlanGateProps) => {
    const hasAccess = hasRequiredPlan(currentPlan, minimumPlan, userRole);

    if (hasAccess) {
        return <>{children}</>;
    }

    return <FallbackUpgradeUI minimumPlan={minimumPlan} />;
};

const FallbackUpgradeUI = ({ minimumPlan }: { minimumPlan: PlanTier }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50/50 text-center space-y-4">
            <div className="p-3 bg-gray-100 rounded-full">
                <Lock className="w-6 h-6 text-gray-500" />
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Plan Upgrade Required</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                    This feature requires the <span className="font-medium text-gray-900">{minimumPlan.replace('_', ' ')}</span> plan or higher.
                </p>
            </div>
            <Button asChild variant="default">
                <Link href="/settings/billing">
                    Upgrade Plan
                </Link>
            </Button>
        </div>
    );
};
