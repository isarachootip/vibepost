import type { LLMRunOutput, WorkspaceLLMConfig } from "@/lib/validations/ai-media.schema";

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
      const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
      let lastErr = "Gemini visual prompt extraction failed";

      for (const model of models) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
              generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
            }),
            signal: AbortSignal.timeout(12_000),
          }
        );
        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          usageMetadata?: {
            promptTokenCount?: number;
            candidatesTokenCount?: number;
            totalTokenCount?: number;
          };
          error?: { message?: string };
        };
        if (!res.ok) {
          lastErr = data.error?.message ?? `Model ${model} failed`;
          continue;
        }
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const pTokens = data.usageMetadata?.promptTokenCount ?? 0;
          const cTokens = data.usageMetadata?.candidatesTokenCount ?? 0;
          const tTokens = data.usageMetadata?.totalTokenCount ?? pTokens + cTokens;
          return {
            text,
            provider: "GEMINI",
            modelName: model,
            promptTokens: pTokens,
            completionTokens: cTokens,
            totalTokens: tTokens,
            estimatedCost: estimateTokenCost(model, pTokens, cTokens),
          };
        }
      }
      throw new Error(lastErr);
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
