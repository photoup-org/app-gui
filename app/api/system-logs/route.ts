import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { LogLevel, LogCategory } from '@prisma/client';

const systemLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string(), // ISO string
  level: z.nativeEnum(LogLevel),
  category: z.nativeEnum(LogCategory),
  action: z.string(),
  message: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  departmentId: z.string(),
  experimentId: z.string().optional(),
  deviceId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // 1. M2M API Security Validation
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.EDGE_WEBHOOK_SECRET;

    if (!expectedToken) {
      console.error('[SystemLogs API] EDGE_WEBHOOK_SECRET is not configured on the server.');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.warn('[SystemLogs API] Unauthorized request attempt.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Payload
    const body = await req.json();
    const result = systemLogSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid payload structure', details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;

    // 3. Insert into Database
    const log = await prisma.systemLog.create({
      data: {
        id: data.id,
        timestamp: new Date(data.timestamp),
        level: data.level,
        category: data.category,
        action: data.action,
        message: data.message,
        metadata: data.metadata || undefined,
        departmentId: data.departmentId,
        experimentId: data.experimentId || undefined,
        deviceId: data.deviceId || undefined,
      }
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error) {
    console.error('[SystemLogs API] Error inserting log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
