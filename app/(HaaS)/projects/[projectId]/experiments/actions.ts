'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createExperimentSchema, CreateExperimentFormValues } from './validations';
import { ExperimentStatus } from '@prisma/client';
import { publishMQTTMessage } from '@/lib/mqtt';

export async function createExperimentAction(projectId: string, data: CreateExperimentFormValues) {
  try {
    const validatedData = createExperimentSchema.parse(data);

    const selectedDevices = await prisma.device.findMany({
      where: { id: { in: validatedData.deviceIds } },
      select: { 
        status: true,
        product: { select: { type: true, name: true } } 
      }
    });

    const hasGateway = selectedDevices.some(d => d.product.type === 'GATEWAY');
    if (hasGateway) {
      throw new Error("Não é possível alocar um Gateway a uma experiência. Selecione apenas sensores.");
    }

    const offlineDevices = selectedDevices.filter(d => d.status !== 'ACTIVE');
    if (offlineDevices.length > 0) {
      const names = offlineDevices.map(d => d.product.name).join(', ');
      throw new Error(`Não é possível iniciar a experiência. Os seguintes sensores estão offline ou em manutenção: ${names}`);
    }

    const experiment = await prisma.experiment.create({
      data: {
        projectId,
        name: validatedData.name,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate || undefined,
        status: 'PLANNED', 
        settings: validatedData.settings || undefined,
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
      select: { status: true, lastRunAt: true, settings: true, devices: { select: { id: true, status: true, serialNumber: true } } }
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
        const aggregationStrategy = settings.aggregationStrategy || 'AVG';
        const anchorTime = Math.floor(Date.now() / 1000);
        const deviceMap = experiment.devices.reduce((acc, d) => {
          if (d.serialNumber) acc[d.serialNumber] = d.id;
          acc[d.id] = d.id;
          return acc;
        }, {} as Record<string, string>);
        
        console.log("MQTT Payload:", { storageFrequency, aggregationStrategy, anchorTime, deviceMap });
        await publishMQTTMessage(`cmd/experiments/${experimentId}/start`, { storageFrequency, aggregationStrategy, anchorTime, deviceMap });
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

export async function deleteExperimentAction(experimentId: string, projectId: string) {
  try {
    const experiment = await prisma.experiment.findUnique({ 
      where: { id: experimentId }, 
      select: { status: true } 
    });
    
    if (experiment && ['RUNNING', 'PAUSED'].includes(experiment.status)) {
      return { success: false, error: "Não é possível apagar uma experiência ativa. Por favor, termine ou aborte a experiência primeiro." };
    }

    await prisma.experiment.delete({
      where: { id: experimentId }
    });
  } catch (error) {
    console.error('Failed to delete experiment:', error);
    return { success: false, error: 'Falha ao apagar experiência' };
  }

  revalidatePath(`/projects/${projectId}`);
  const { redirect } = await import('next/navigation');
  redirect(`/projects/${projectId}`);
}

export async function getExperimentTelemetryForExport(experimentId: string) {
  try {
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      include: {
        project: true
      }
    });

    if (!experiment) {
      return { success: false, error: 'Experiência não encontrada' };
    }

    const readings = await prisma.sensorReading.findMany({
      where: { experimentId },
      orderBy: { timestamp: 'asc' },
      include: {
        device: {
          select: {
            serialNumber: true
          }
        }
      }
    });

    // Formatting for client side
    const settings = typeof experiment.settings === 'object' && experiment.settings !== null 
      ? experiment.settings as Record<string, any> 
      : {};

    const exportData = {
      project: {
        name: experiment.project.name,
        description: experiment.project.description,
        createdAt: experiment.project.createdAt
      },
      experiment: {
        name: experiment.name,
        status: experiment.status,
        startDate: experiment.startDate,
        endDate: experiment.endDate,
        storageFrequency: settings.storageFrequency || 60,
        aggregationStrategy: settings.aggregationStrategy || 'AVG'
      },
      telemetry: readings
    };

    return { 
      success: true, 
      data: exportData,
      experimentName: experiment.name
    };
  } catch (error) {
    console.error('Failed to fetch telemetry for export:', error);
    return { success: false, error: 'Falha ao obter os dados da experiência' };
  }
}
