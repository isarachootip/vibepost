import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";

export async function GET() {
  try {
    const workspace = await getActiveWorkspaceContext();
    if (!workspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    const config = await prisma.promptConfig.findFirst({
      where: { workspaceId: workspace.id, provider: "GEMINI" },
    });

    if (!config) {
      return NextResponse.json({ error: "No Gemini API Key saved in Settings" }, { status: 400 });
    }

    const apiKey = config.apiKey;
    const results: Record<string, any> = {};

    // Test 1: List available models
    try {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      const listData = await listRes.json();
      if (!listRes.ok) {
        results.listModels = { ok: false, error: listData.error?.message || "Unknown error", status: listRes.status };
      } else {
        const models = (listData.models || [])
          .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
          .map((m: any) => m.name);
        results.listModels = { ok: true, availableModels: models };
      }
    } catch (e: any) {
      results.listModels = { ok: false, error: e.message };
    }

    // Test 2: Try generateContent on each candidate model
    const modelsToTest = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.0-pro",
      "gemini-pro",
    ];

    for (const model of modelsToTest) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Say hello" }] }],
            }),
          }
        );
        const data = await res.json();
        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          results[model] = { ok: true, response: "✅ Works!" };
        } else {
          results[model] = { ok: false, status: res.status, error: data.error?.message };
        }
      } catch (e: any) {
        results[model] = { ok: false, error: e.message };
      }
    }

    return NextResponse.json({
      keyPrefix: apiKey.substring(0, 10) + "...",
      keyLength: apiKey.length,
      results,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
