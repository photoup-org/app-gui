import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('x-edge-token');
    
    // Optional: Only enforce if secret is set in env
    if (process.env.EDGE_API_SECRET && authHeader !== process.env.EDGE_API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { device_id, driver, interval, firmware_version, gateway_id, schema } = body;

    if (!device_id) {
      return NextResponse.json({ error: 'Missing device_id' }, { status: 400 });
    }

    if (!gateway_id) {
      return NextResponse.json({ error: 'Missing gateway_id' }, { status: 400 });
    }

    // 1. Find the departmentId from the Gateway
    const gateway = await prisma.device.findFirst({
      where: {
        OR: [
          { id: gateway_id },
          { serialNumber: gateway_id }
        ],
        product: {
          type: 'GATEWAY'
        }
      }
    });

    if (!gateway) {
      return NextResponse.json({ error: `Gateway with ID ${gateway_id} not found` }, { status: 400 });
    }

    const departmentId = gateway.departmentId;

    // 2. Find the productId from the driver
    let hardwareProduct = await prisma.hardwareProduct.findFirst({
      where: { sku: driver }
    });

    if (!hardwareProduct) {
      // Fallback: Find any base sensor or generic product
      hardwareProduct = await prisma.hardwareProduct.findFirst({
        where: { type: 'SENSOR_BASE' }
      });
      
      if (!hardwareProduct) {
        return NextResponse.json({ error: 'No hardware products available for fallback' }, { status: 500 });
      }
    }

    // 3. Upsert the device
    const existingDevice = await prisma.device.findUnique({
      where: { id: device_id }
    });

    const existingConfig = existingDevice?.config && typeof existingDevice.config === 'object' 
      ? existingDevice.config 
      : {};

    const updatedConfig = {
      ...existingConfig,
      firmware_version: firmware_version || 'unknown',
      interval: interval || 10,
      name: (existingConfig as any).name || `Sensor - ${device_id.slice(-4)}`,
      ...(schema ? { schema } : {})
    };

    const device = await prisma.device.upsert({
      where: { id: device_id },
      update: {
        config: updatedConfig,
        departmentId: departmentId // Ensure it stays attached to the gateway's department
      },
      create: {
        id: device_id,
        serialNumber: device_id,
        status: 'PENDING_CONNECTION',
        productId: hardwareProduct.id,
        departmentId: departmentId,
        config: updatedConfig
      }
    });

    return NextResponse.json({ success: true, device }, { status: existingDevice ? 200 : 201 });
  } catch (error: any) {
    console.error('[Sensor Registration Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
