'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createExperimentSchema, CreateExperimentFormValues } from './validations';

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
