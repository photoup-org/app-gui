import { NextRequest, NextResponse } from 'next/server';
import { getAppSession } from '@/lib/core/auth/session';
import { tools } from '@/lib/ai/haas-tools';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request using custom getAppSession wrapper
    const session = await getAppSession(req);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, history, departmentId: frontendDepartmentId } = body;

    // Extract tenantId (fallback logic for different claim patterns)
    const tenantId = frontendDepartmentId || session.user.departmentId || session.user.app_metadata?.departmentId || session.user.org_id;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found in session. Please select an organization.' }, { status: 403 });
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Map old history format or simple { role, text } to Vercel AI Core messages
    const messages: any[] = [
      ...(history || []).map((msg: any) => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.parts ? msg.parts[0].text : msg.text || '',
      })),
      { role: 'user', content: prompt }
    ];

    const result = await generateText({
      model: google('gemini-2.5-pro'),
      system: "You are a HaaS platform assistant. Help the user manage their hardware fleet and billing. Always fetch live data using tools before answering specific account questions. When listing multiple items, hardware statuses, active devices, or structured data logs, you must ALWAYS format the response as a clean, standardized Markdown table or bulleted list. Use bold text for headers and wrap status parameters elegantly.",
      messages,
      stopWhen: stepCountIs(5),
      tools: {
        getFleetHealthSummary: tool({
          description: 'Get health summary of the hardware fleet',
          inputSchema: z.object({}),
          execute: async () => await tools.getFleetHealthSummary(tenantId),
        }),
        getCurrentBillingTier: tool({
          description: 'Get current billing tier details',
          inputSchema: z.object({}),
          execute: async () => await tools.getCurrentBillingTier(tenantId),
        }),
        getFleetDevices: tool({
          description: 'Get devices in the fleet, optionally filtered by status',
          inputSchema: z.object({
            status: z.string().optional().describe("Filter by status (e.g., 'active', 'offline', 'maintenance')"),
          }),
          execute: async ({ status }) => await tools.getFleetDevices(tenantId, status),
        }),
        getProjectAndExperimentDetails: tool({
          description: 'Search for project and experiment details',
          inputSchema: z.object({
            searchString: z.string().describe('Search query string'),
          }),
          execute: async ({ searchString }) => await tools.getProjectAndExperimentDetails(tenantId, searchString),
        }),
        getRecentSystemAlerts: tool({
          description: 'Get recent system alerts',
          inputSchema: z.object({
            limit: z.number().optional().describe('Number of alerts to return'),
          }),
          execute: async ({ limit }) => await tools.getRecentSystemAlerts(tenantId, limit),
        }),
        getDeviceCalibrationAudit: tool({
          description: 'Get calibration audit history for a specific device',
          inputSchema: z.object({
            serialNumber: z.string().describe('The serial number of the device'),
          }),
          execute: async ({ serialNumber }) => await tools.getDeviceCalibrationAudit(tenantId, serialNumber),
        }),
      },
    });

    return NextResponse.json({
      text: result.text,
      history: [
        ...(history || []),
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: [{ text: result.text }] }
      ]
    });

  } catch (error: any) {
    console.error('AI Assistant Error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
