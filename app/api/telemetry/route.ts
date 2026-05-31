import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const payloadSchema = z.object({
  experimentId: z.string().optional(),
  readings: z.array(
    z.object({
      deviceId: z.string(),
      timestamp: z.string(), // ISO String or Unix timestamp could be passed, but ISO string is safer
      data: z.record(z.string(), z.number()),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = payloadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid payload structure', details: result.error.format() },
        { status: 400 }
      );
    }

    const { experimentId, readings } = result.data;
    
    if (experimentId) {
      const experiment = await prisma.experiment.findUnique({
        where: { id: experimentId },
        select: { status: true }
      });

      if (!experiment || experiment.status !== 'RUNNING') {
        console.warn(`[Telemetry API] Rejected telemetry for experiment ${experimentId}. Status is ${experiment?.status || 'NOT_FOUND'}`);
        return NextResponse.json(
          { error: "Data rejected. Experiment is not currently RUNNING." }, 
          { status: 403 }
        );
      }
    }

    // Flatten the nested data object into individual SensorReading rows
    const sensorReadingsData = readings.flatMap((reading) => {
      const timestamp = new Date(reading.timestamp);
      
      return Object.entries(reading.data).map(([metricType, value]) => ({
        deviceId: reading.deviceId,
        experimentId: experimentId || undefined,
        timestamp,
        metricType,
        value,
      }));
    });

    if (sensorReadingsData.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Use createMany for bulk insertion
    const createResult = await prisma.sensorReading.createMany({
      data: sensorReadingsData,
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true, count: createResult.count });
  } catch (error) {
    console.error('[Telemetry API] Error inserting readings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
