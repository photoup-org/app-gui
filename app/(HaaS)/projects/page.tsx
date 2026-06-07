import React from 'react';
import { getAppSession } from '@/lib/core/auth/session';
import { getUserWorkspaceContext } from "@/lib/services/workspace";
import prisma from '@/lib/core/prisma';
import ProjectList from "@/app/(HaaS)/projects/_components/ProjectList";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
    const session = await getAppSession();
    if (!session?.user) redirect("/");

    const userContext = await getUserWorkspaceContext(session.user.sub);
    if (!userContext) redirect("/auth/logout");

    const projects = await prisma.project.findMany({
        where: {
            departmentId: userContext.department.id,
        },
        include: {
            _count: {
                select: {
                    experiments: true,
                    devices: true,
                }
            }
        },
        orderBy: {
            updatedAt: "desc"
        }
    });

    return (
        <div className="flex flex-col items-center w-full px-4 py-8">
            <ProjectList projects={projects} />
        </div>
    );
}
