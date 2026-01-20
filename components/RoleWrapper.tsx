import { auth0 } from '@/lib/auth0';
import { AppRole } from '@/lib/roles';

type RoleWrapperProps = {
    children: React.ReactNode;
    allowedRoles: AppRole[];
};

export async function RoleWrapper({ children, allowedRoles }: RoleWrapperProps) {
    const session = await auth0.getSession();
    const user = session?.user;

    // Use the namespace to look up roles in the user object
    const userRoles = user?.[`${process.env.AUTH0_NAMESPACE}/roles`] as string[] | undefined;

    const hasAccess = userRoles?.some((role) => allowedRoles.includes(role as AppRole)) ?? false;

    if (!hasAccess) {
        return null; // Or render a "Not Authorized" message/component
    }

    return <>{children}</>;
}
