'use client';

import { useUser } from '@/contexts/UserContext';
import { RoleWrapper } from '@/components/RoleWrapper';
import { AppRoles } from '@/lib/roles';

export default function Home() {
  const { user } = useUser();
  const userRoles = user?.roles;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-5xl flex-col items-center justify-start py-20 px-8 bg-white dark:bg-black sm:items-start">

        {/* Header / User Info */}
        <div className="w-full flex justify-between items-center mb-12 border-b pb-6">
          <h1 className="text-3xl font-bold">IoT Monitor</h1>
          {user ? (
            <div className="flex gap-4 items-center">
              <div className="flex flex-col items-end">
                <span className="font-bold">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
                <div className="flex gap-1 mt-1">
                  {userRoles?.map((role) => (
                    <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                      {role}
                    </span>
                  ))}
                  {!userRoles?.length && <span className="text-xs text-gray-500">No Roles Assigned</span>}
                </div>
              </div>
              <a
                href="/auth/logout"
                className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors text-sm"
              >
                Logout
              </a>
            </div>
          ) : (
            <a
              href="/auth/login"
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
            >
              Login
            </a>
          )}
        </div>

        {/* Role Verification Section */}
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6">Role Verification</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Public Content - Visible to everyone */}
            <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-semibold mb-2">Public Content</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Visible to all users (authenticated or not).</p>
              <button className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors" onClick={() => window.location.href = '/pricing'}>Pricing</button>
            </div>

            {/* User Role Content */}
            <RoleWrapper allowedRoles={[AppRoles.USER, AppRoles.ADMIN, AppRoles.SUPER_ADMIN]}>
              <div className="p-6 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-300">User Access</h3>
                <p className="text-sm text-green-600 dark:text-green-400">Visible to Users, Admins, and Super Admins.</p>
              </div>
            </RoleWrapper>

            {/* Admin Role Content */}
            <RoleWrapper allowedRoles={[AppRoles.ADMIN, AppRoles.SUPER_ADMIN]}>
              <div className="p-6 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">Admin Access</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">Visible to Admins and Super Admins.</p>
              </div>
            </RoleWrapper>

            {/* Super Admin Role Content */}
            <RoleWrapper allowedRoles={[AppRoles.SUPER_ADMIN]}>
              <div className="p-6 border rounded-lg bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-300">Super Admin Access</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">Visible ONLY to Super Admins.</p>
              </div>
            </RoleWrapper>
          </div>
        </div>
      </main>
    </div>
  );
}
