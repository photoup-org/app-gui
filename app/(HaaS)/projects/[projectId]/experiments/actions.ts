'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createExperimentSchema, CreateExperimentFormValues } from './validations';
import { ExperimentStatus } from '@prisma/client';

export async function createExperimentAction(projectId: string, data: CreateExperimentFormValues) {
  try {
    const validatedData = createExperimentSchema.parse(data);

    const experiment = await prisma.experiment.create({
      data: {
        projectId,
        name: validatedData.name,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate || undefined,
        status: 'RUNNING', 
        lastRunAt: new Date(),
        devices: {
          connect: validatedData.deviceIds.map((id) => ({ id }))
        }
      }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, experimentId: experiment.id };
  } catch (error) {
    console.error('Failed to create experiment:', error);
    return { success: false, error: 'Falha ao criar experiência' };
  }
}

export async function updateExperimentLifecycle(projectId: string, experimentId: string, newStatus: ExperimentStatus) {
  try {
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      select: { status: true, lastRunAt: true }
    });

    if (!experiment) {
      return { success: false, error: 'Experiência não encontrada' };
    }

    const currentStatus = experiment.status;
    const now = new Date();
    const data: any = { status: newStatus };

    if ((currentStatus === 'PLANNED' || currentStatus === 'PAUSED') && newStatus === 'RUNNING') {
      data.lastRunAt = now;
    }

    if (currentStatus === 'RUNNING' && newStatus === 'PAUSED') {
      const elapsedSeconds = experiment.lastRunAt ? Math.floor((now.getTime() - experiment.lastRunAt.getTime()) / 1000) : 0;
      data.accumulatedSeconds = { increment: elapsedSeconds };
      data.lastRunAt = null;
    }

    if (currentStatus === 'RUNNING' && newStatus === 'COMPLETED') {
      const elapsedSeconds = experiment.lastRunAt ? Math.floor((now.getTime() - experiment.lastRunAt.getTime()) / 1000) : 0;
      data.accumulatedSeconds = { increment: elapsedSeconds };
      data.endDate = now;
      data.lastRunAt = null;
    }

    if (currentStatus !== 'RUNNING' && newStatus === 'COMPLETED') {
      data.endDate = now;
      data.lastRunAt = null;
    }

    await prisma.experiment.update({
      where: { id: experimentId },
      data
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/experiments/${experimentId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update experiment lifecycle:', error);
    return { success: false, error: 'Falha ao atualizar o estado da experiência' };
  }
}
