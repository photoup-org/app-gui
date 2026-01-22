'use client';

import { useUser } from '@/contexts/UserContext';
import { AppRole } from '@/lib/roles';

type RoleWrapperProps = {
    children: React.ReactNode;
    allowedRoles: AppRole[];
};

export function RoleWrapper({ children, allowedRoles }: RoleWrapperProps) {
    const { user } = useUser();
    const userRoles = user?.roles;

    const hasAccess = userRoles?.some((role) => allowedRoles.includes(role as AppRole)) ?? false;

    if (!hasAccess) {
        return null; // Or render a "Not Authorized" message/component
    }

    return <>{children}</>;
}
