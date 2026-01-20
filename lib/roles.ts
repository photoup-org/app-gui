export const AppRoles = {
    SUPER_ADMIN: 'super-admin',
    ADMIN: 'admin',
    USER: 'user',
} as const;

export type AppRole = (typeof AppRoles)[keyof typeof AppRoles];

export const ALL_ROLES = Object.values(AppRoles);
