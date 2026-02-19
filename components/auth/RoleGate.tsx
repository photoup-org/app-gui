import { ReactNode } from "react";
import { Role } from "@prisma/client";

interface RoleGateProps {
    children: ReactNode;
    allowedRoles: Role[];
    userRole?: Role | string | null;
}

export const RoleGate = ({ children, allowedRoles, userRole }: RoleGateProps) => {
    if (!userRole) return null;

    // SUPER_ADMIN bypass (God Mode)
    if (userRole === "SUPER_ADMIN") {
        return <>{children}</>;
    }

    // Check if the user's role is in the list of allowed roles.
    // We strictly check inclusion here. If hierarchy support is needed for the list,
    // the caller should provide all applicable roles, e.g. ['ADMIN', 'OPERATOR']
    // or we could use the hasRequiredRole utility if we changed the prop to 'minRole'.
    // Given 'allowedRoles' (plural array), we assume explicit list check.
    if (allowedRoles.includes(userRole as Role)) {
        return <>{children}</>;
    }

    return null;
};
