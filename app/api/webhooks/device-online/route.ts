import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DeviceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  // 1. Security Check: Enforce Bearer Token authorization
  const authHeader = req.headers.get("authorization");
  const secret = process.env.EDGE_WEBHOOK_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    console.error("[Device Online Webhook] Unauthorized attempt. Missing or mismatched Bearer token.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { deviceId } = body;

    // 2. Validate payload
    if (deviceId === undefined || deviceId === null) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    }

    // Devices are stored with CUID string keys in Prisma schema. 
    // We convert deviceId to string format.
    const idStr = String(deviceId);

    // 3. Find device
    const device = await prisma.device.findUnique({
      where: { id: idStr },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // 4. Update status if PENDING_CONNECTION
    if (device.status === DeviceStatus.PENDING_CONNECTION) {
      await prisma.device.update({
        where: { id: idStr },
        data: { status: DeviceStatus.ACTIVE },
      });

      console.log(`[Device Online Webhook] Device ${idStr} updated from PENDING_CONNECTION to ACTIVE.`);

      // 5. Revalidate cache on dashboard and root index immediately
      revalidatePath("/dashboard");
      revalidatePath("/");

      return NextResponse.json({ success: true, updated: true });
    }

    // 6. If already ACTIVE or other status, return 200 OK without DB write
    return NextResponse.json({ success: true, updated: false });

  } catch (error: any) {
    console.error("[Device Online Webhook Error]:", error?.message || error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
