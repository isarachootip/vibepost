import type { LLMRunOutput, WorkspaceLLMConfig } from "@/lib/validations/ai-media.schema";
import { runGeminiContentWithFallback } from "./gemini-client.service";

export type LLMRunnerFn = (systemPrompt: string, userPrompt: string) => Promise<LLMRunOutput>;

function estimateTokenCost(model: string, promptTokens: number, completionTokens: number): number {
  const lower = model.toLowerCase();
  if (lower.includes("gemini-2.5-pro")) {
    return (promptTokens * 1.25 + completionTokens * 5.0) / 1_000_000;
  }
  if (lower.includes("gemini")) {
    return (promptTokens * 0.075 + completionTokens * 0.3) / 1_000_000;
  }
  if (lower.includes("moonshot")) {
    return (promptTokens * 1.65 + completionTokens * 1.65) / 1_000_000;
  }
  return (promptTokens * 0.5 + completionTokens * 1.5) / 1_000_000;
}

export function createWorkspaceLLMRunner(config: WorkspaceLLMConfig | null): LLMRunnerFn | null {
  if (!config || !config.apiKey.trim()) return null;

  return async (systemPrompt: string, userPrompt: string): Promise<LLMRunOutput> => {
    if (config.provider === "GEMINI") {
      const out = await runGeminiContentWithFallback({
        apiKey: config.apiKey,
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
        timeoutMs: 12_000,
      });
      return {
        text: out.text,
        provider: "GEMINI",
        modelName: out.model,
        promptTokens: out.promptTokens,
        completionTokens: out.completionTokens,
        totalTokens: out.totalTokens,
        estimatedCost: estimateTokenCost(out.model, out.promptTokens, out.completionTokens),
      };
    }

    const isKimi = config.provider === "KIMI";
    const endpoint = isKimi
      ? "https://api.moonshot.cn/v1/chat/completions"
      : "https://openrouter.ai/api/v1/chat/completions";
    const modelName = isKimi ? "moonshot-v1-8k" : "openai/gpt-3.5-turbo";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      error?: { message?: string };
    };
    const content = data.choices?.[0]?.message?.content;
    if (!res.ok || !content) {
      throw new Error(data.error?.message ?? "LLM visual prompt extraction failed");
    }
    const pTokens = data.usage?.prompt_tokens ?? 0;
    const cTokens = data.usage?.completion_tokens ?? 0;
    const tTokens = data.usage?.total_tokens ?? pTokens + cTokens;
    return {
      text: content,
      provider: isKimi ? "KIMI" : "OPENAI",
      modelName,
      promptTokens: pTokens,
      completionTokens: cTokens,
      totalTokens: tTokens,
      estimatedCost: estimateTokenCost(modelName, pTokens, cTokens),
    };
  };
}
