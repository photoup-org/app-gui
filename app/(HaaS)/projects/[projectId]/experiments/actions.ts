'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createExperimentSchema, CreateExperimentFormValues } from './validations';
import { ExperimentStatus } from '@prisma/client';
import { publishMQTTMessage } from '@/lib/mqtt';

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
        settings: validatedData.settings || undefined,
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
      select: { status: true, lastRunAt: true, settings: true, devices: { select: { id: true, status: true } } }
    });

    if (!experiment) {
      return { success: false, error: 'Experiência não encontrada' };
    }

    if (newStatus === 'RUNNING') {
      const offlineDevices = experiment.devices.filter(d => d.status !== 'ACTIVE');
      if (offlineDevices.length > 0) {
        throw new Error("Cannot start experiment: One or more allocated devices are offline.");
      }
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

    try {
      if (newStatus === 'RUNNING') {
        const settings = (experiment.settings as any) || {};
        const storageFrequency = parseInt(settings.storageFrequency) || 60;
        const anchorTime = Math.floor(Date.now() / 1000);
        const deviceIds = experiment.devices.map(d => d.id);
        console.log("MQTT Payload:", { storageFrequency, anchorTime, deviceIds });
        await publishMQTTMessage(`cmd/experiments/${experimentId}/start`, { storageFrequency, anchorTime, deviceIds });
      } else if (newStatus === 'PAUSED' || newStatus === 'COMPLETED') {
        await publishMQTTMessage(`cmd/experiments/${experimentId}/flush`, {});
      }
    } catch (mqttError) {
      console.error('Failed to publish MQTT lifecycle hook:', mqttError);
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/experiments/${experimentId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update experiment lifecycle:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Falha ao atualizar o estado da experiência' 
    };
  }
}
