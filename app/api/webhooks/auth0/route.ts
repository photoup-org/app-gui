import { NextRequest, NextResponse } from "next/server";
import * as handlers from "@/lib/services/auth0-handlers";

export async function POST(req: NextRequest) {
    // 1. Authenticate the Webhook
    const authHeader = req.headers.get("authorization");
    const secret = process.env.AUTH0_WEBHOOK_SECRET;
    console.log("[Auth0 Webhook Debug] Header recebido:", authHeader ? `Sim (Tamanho: ${authHeader.length})` : "NULO");
    console.log("[Auth0 Webhook Debug] Segredo de ambiente existe?", !!secret, secret ? `(Tamanho: ${secret.length})` : "");
    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { email, auth0UserId, auth0OrgId } = body;

        try {
            await handlers.handlePostLoginSync(email, auth0UserId, auth0OrgId);
            return NextResponse.json({ success: true });
        } catch (handlerError: any) {
            if (handlerError.message === "Missing required fields") {
                return NextResponse.json({ error: handlerError.message }, { status: 400 });
            }
            if (handlerError.message === "Department not found") {
                return NextResponse.json({ error: handlerError.message }, { status: 404 });
            }
            throw handlerError; // Rethrow to outer catch
        }

    } catch (error: any) {
        console.error("[Auth0 Webhook] Error processing post-login sync:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
