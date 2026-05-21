"use server";

import { getAppSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ProjectRole } from "@prisma/client";

export interface DepartmentMember {
    id: string;
    name: string | null;
    email: string;
    role: string;
    image?: string | null;
}

export interface AvailableDevice {
    id: string;
    serialNumber: string;
    status: string;
    productId: string;
    product: {
        id: string;
        sku: string;
        name: string;
        subtitle: string;
        type: string;
    };
}

/**
 * Server Action to fetch all users in the current user's department.
 */
export async function getDepartmentMembersAction() {
    const session = await getAppSession();
    if (!session?.user) {
        return { success: false, error: "Não autorizado.", members: [] as DepartmentMember[] };
    }

    const user = await prisma.user.findUnique({
        where: { auth0UserId: session.user.sub },
        select: { departmentId: true }
    });

    if (!user || !user.departmentId) {
        return { success: false, error: "Departamento não encontrado.", members: [] as DepartmentMember[] };
    }

    try {
        const members = await prisma.user.findMany({
            where: { departmentId: user.departmentId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true
            },
            orderBy: { name: "asc" }
        });

        return { success: true, members: members as DepartmentMember[] };
    } catch (error) {
        console.error("Error fetching department members:", error);
        return { success: false, error: "Erro ao obter membros.", members: [] as DepartmentMember[] };
    }
}

/**
 * Server Action to fetch available devices (projectId is null) for the department.
 */
export async function getAvailableDevicesAction() {
    const session = await getAppSession();
    if (!session?.user) {
        return { success: false, error: "Não autorizado.", devices: [] as AvailableDevice[] };
    }

    const user = await prisma.user.findUnique({
        where: { auth0UserId: session.user.sub },
        select: { departmentId: true }
    });

    if (!user || !user.departmentId) {
        return { success: false, error: "Departamento não encontrado.", devices: [] as AvailableDevice[] };
    }

    try {
        const devices = await prisma.device.findMany({
            where: {
                departmentId: user.departmentId,
                status: "ACTIVE"
            },
            include: {
                product: {
                    select: {
                        id: true,
                        sku: true,
                        name: true,
                        subtitle: true,
                        type: true
                    }
                }
            },
            orderBy: { serialNumber: "asc" }
        });

        return { success: true, devices: devices as unknown as AvailableDevice[] };
    } catch (error) {
        console.error("Error fetching available devices:", error);
        return { success: false, error: "Erro ao obter equipamentos.", devices: [] as AvailableDevice[] };
    }
}

/**
 * Server Action to create a new project, assign members, allocate devices, and redirect.
 */
export async function createProjectAction(data: {
    name: string;
    description?: string;
    members: { userId: string; role: ProjectRole }[];
    deviceIds: string[];
    settings: any;
}) {
    const session = await getAppSession();
    if (!session?.user) {
        return { success: false, error: "Não autorizado." };
    }

    const user = await prisma.user.findUnique({
        where: { auth0UserId: session.user.sub },
        select: { id: true, departmentId: true }
    });

    if (!user || !user.departmentId) {
        return { success: false, error: "Organização ou utilizador não encontrado." };
    }

    const userDeptId = user.departmentId;
    const userId = user.id;
    let newProjectId: string | null = null;

    try {
        const newProject = await prisma.$transaction(async (tx) => {
            // 1. Create project
            const project = await tx.project.create({
                data: {
                    name: data.name,
                    description: data.description || "",
                    departmentId: userDeptId,
                    createdById: userId,
                    settings: data.settings || {},
                    devices: {
                        connect: data.deviceIds.map((id) => ({ id }))
                    }
                }
            });

            // 2. Add members
            const finalMembers = [...data.members];
            // Ensure the creator is OWNER if not already in the list
            if (!finalMembers.some(m => m.userId === userId)) {
                finalMembers.push({ userId, role: "OWNER" });
            }

            await tx.projectMember.createMany({
                data: finalMembers.map(m => ({
                    projectId: project.id,
                    userId: m.userId,
                    role: m.role
                })),
                skipDuplicates: true
            });

            return project;
        });

        newProjectId = newProject.id;
    } catch (error: any) {
        console.error("Error in createProjectAction:", error);
        return { success: false, error: error.message || "Ocorreu um erro ao criar o projeto." };
    }

    if (newProjectId) {
        revalidatePath("/dashboard");
        revalidatePath("/projects");
        redirect(`/projects/${newProjectId}`);
    }

    return { success: false, error: "Erro desconhecido." };
}

export async function deleteProjectAction(projectId: string) {
  try {
    await prisma.project.delete({
      where: { id: projectId }
    });
    
    // Adjust path as necessary based on where the dashboard lives
    revalidatePath("/"); 
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return { success: false, error: "Falha ao eliminar o projeto." };
  }
}
