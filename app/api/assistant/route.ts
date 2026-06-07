import { NextRequest, NextResponse } from 'next/server';
import { getAppSession } from '@/lib/core/auth/session';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { tools, haasFunctionDeclarations } from '@/lib/ai/haas-tools';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

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

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL!,
      systemInstruction: "You are a HaaS platform assistant. Help the user manage their hardware fleet and billing. Always fetch live data using tools before answering specific account questions. When listing multiple items, hardware statuses, active devices, or structured data logs, you must ALWAYS format the response as a clean, standardized Markdown table or bulleted list. Use bold text for headers and wrap status parameters elegantly.",
      tools: [{ functionDeclarations: haasFunctionDeclarations }]
    });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(prompt);
    let geminiResponse = result.response;

    // Intercept function calls
    const calls = geminiResponse.functionCalls();
    if (calls && calls.length > 0) {
      const functionResponses = [];

      for (const call of calls) {
        if (call.name === 'getFleetHealthSummary') {
          const data = await tools.getFleetHealthSummary(tenantId);
          functionResponses.push({ functionResponse: { name: call.name, response: Array.isArray(data) ? { result: data } : data } });
        } else if (call.name === 'getCurrentBillingTier') {
          const data = await tools.getCurrentBillingTier(tenantId);
          functionResponses.push({ functionResponse: { name: call.name, response: Array.isArray(data) ? { result: data } : data } });
        } else if (call.name === 'getFleetDevices') {
          const { status } = call.args as any;
          const data = await tools.getFleetDevices(tenantId, status);
          functionResponses.push({ functionResponse: { name: call.name, response: Array.isArray(data) ? { result: data } : data } });
        } else if (call.name === 'getProjectAndExperimentDetails') {
          const { searchString } = call.args as any;
          const data = await tools.getProjectAndExperimentDetails(tenantId, searchString);
          functionResponses.push({ functionResponse: { name: call.name, response: Array.isArray(data) ? { result: data } : data } });
        } else if (call.name === 'getRecentSystemAlerts') {
          const { limit } = call.args as any;
          const data = await tools.getRecentSystemAlerts(tenantId, limit);
          functionResponses.push({ functionResponse: { name: call.name, response: Array.isArray(data) ? { result: data } : data } });
        } else if (call.name === 'getDeviceCalibrationAudit') {
          const { serialNumber } = call.args as any;
          const data = await tools.getDeviceCalibrationAudit(tenantId, serialNumber);
          functionResponses.push({ functionResponse: { name: call.name, response: Array.isArray(data) ? { result: data } : data } });
        }
      }

      // Send the function response back to Gemini to synthesize final answer
      const secondResult = await chat.sendMessage(functionResponses);
      geminiResponse = secondResult.response;
    }

    return NextResponse.json({
      text: geminiResponse.text(),
      history: await chat.getHistory()
    });

  } catch (error: any) {
    console.error('AI Assistant Error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
