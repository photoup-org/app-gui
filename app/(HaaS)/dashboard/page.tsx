import { auth0 } from "@/lib/auth0";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RoleGate } from "@/components/auth/RoleGate";
import { PlanGate } from "@/components/auth/PlanGate";
import { hasRequiredRole } from "@/lib/auth/permissions";
import { Role } from "@prisma/client";

export default async function Page() {
    const session = await auth0.getSession();

    // Middleware should catch this, but safeguard anyway
    if (!session?.user) {
        redirect("/");
    }

    // Fetch db user using the Auth0 sub as the key
    const user = await prisma.user.findUnique({
        where: { auth0UserId: session.user.sub },
        include: {
            department: true,
        },
    });

    // If user not found in DB but is authenticated, handle appropriately
    if (!user) {
        console.log("User not found in DB but is authenticated");
        redirect("/auth/logout");
    }

    // @ts-ignore
    if (!hasRequiredRole(user.role, Role.OPERATOR)) {
        redirect("/auth/logout");
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="border-b pb-6">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-gray-500 mt-2">Manage your organization settings and preferences.</p>
                <div className="mt-4 flex gap-4 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">Role: <span className="font-semibold text-gray-900">{user.role}</span></span>
                    <span className="bg-gray-100 px-2 py-1 rounded">Plan: <span className="font-semibold text-gray-900">{user.department.plan}</span></span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* RoleGate Example: Admin Only Area */}
                <div className="p-6 border rounded-xl shadow-sm bg-white">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">User Management</h2>
                    <RoleGate allowedRoles={['ADMIN']} userRole={user.role}>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <h3 className="text-green-800 font-medium mb-2">Admin Controls</h3>
                            <p className="text-green-700 text-sm">
                                As an Admin, you can invite new users, manage existing accounts, and assigned roles.
                            </p>
                            <div className="mt-4">
                                <button className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition">
                                    Invite User
                                </button>
                            </div>
                        </div>
                    </RoleGate>
                    {/* @ts-ignore */}
                    {(!['ADMIN'].includes(user.role as Role) && user.role !== 'SUPER_ADMIN') && (
                        <div className="bg-gray-50 p-4 rounded-lg text-center border border-dashed">
                            <p className="text-sm text-gray-500">You need to be an Admin to access User Management.</p>
                        </div>
                    )}
                </div>

                {/* PlanGate Example: Industrial Pro Feature */}
                <div className="p-6 border rounded-xl shadow-sm bg-white">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Advanced Analytics</h2>
                    <p className="text-gray-500 text-sm mb-4">
                        Access real-time telemetry graphs and export historic data to CSV.
                    </p>
                    <PlanGate
                        minimumPlan="INDUSTRIAL_PRO"
                        currentPlan={user.department.plan}
                        userRole={user.role}
                    >
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="text-blue-800 font-medium mb-2">Analytics Dashboard</h3>
                            <p className="text-blue-700 text-sm mb-4">
                                Your plan includes full access to the analytics suite.
                            </p>
                            <div className="flex gap-2">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition">
                                    View Graphs
                                </button>
                                <button className="bg-white border text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 transition">
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </PlanGate>
                </div>
            </div>
        </div>
    );
}
