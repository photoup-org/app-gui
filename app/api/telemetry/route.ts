import { NextResponse } from 'next/server';
import prisma from '@/lib/core/prisma';
import { z } from 'zod';
import { writeTelemetry } from '@/lib/db/influx';

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

    if (readings.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const uniqueDeviceIds = Array.from(new Set(readings.map(r => r.deviceId)));
    
    // Fetch devices to get tenantId (departmentId) and check status
    const devices = await prisma.device.findMany({
      where: { id: { in: uniqueDeviceIds } },
      select: { id: true, status: true, departmentId: true }
    });

    const deviceMap = new Map(devices.map(d => [d.id, d.departmentId]));

    const points = readings.map((reading) => {
      const tenantId = deviceMap.get(reading.deviceId) || 'unknown';
      return {
        deviceId: reading.deviceId,
        tenantId,
        experimentId: experimentId || undefined,
        timestamp: new Date(reading.timestamp),
        fields: reading.data
      };
    });

    // Write to InfluxDB
    await writeTelemetry(points);

    return NextResponse.json({ success: true, count: points.length });
  } catch (error) {
    console.error('[Telemetry API] Error inserting readings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
