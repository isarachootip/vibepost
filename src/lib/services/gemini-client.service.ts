// Centralized Google Gemini client with multi-generation model fallback (3.x + legacy 2.5),
// per-model timeout, thought-part filtering, and root-cause error preservation.

export const GEMINI_TEXT_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
] as const;

export const GEMINI_IMAGE_CONTENT_MODELS = ["gemini-3.1-flash-image", "gemini-2.5-flash-image"] as const;
const IMAGEN_LEGACY_MODEL = "imagen-4.0-fast-generate-001";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

export interface GeminiGenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  responseModalities?: ReadonlyArray<"TEXT" | "IMAGE">;
}

export interface RunGeminiContentInput {
  apiKey: string;
  parts: GeminiPart[];
  models?: readonly string[];
  generationConfig?: GeminiGenerationConfig;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

export interface RunGeminiContentOutput {
  text: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface GenerateGeminiImageInput {
  apiKey: string;
  prompt: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

export interface GenerateGeminiImageOutput {
  base64Bytes: string;
  model: string;
}

interface GeminiResponsePart {
  text?: string;
  thought?: boolean;
  inlineData?: { mimeType?: string; data?: string };
}

interface GeminiApiResponse {
  candidates?: Array<{ content?: { parts?: GeminiResponsePart[] } }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  predictions?: Array<{ bytesBase64Encoded?: string }>;
  error?: { status?: string; message?: string };
}

class FatalGeminiAuthError extends Error {}

function isFatalAuthError(status: number, message: string): boolean {
  return status === 401 || status === 403 || (status === 400 && /api[_\s-]?key/i.test(message));
}

async function postGeminiJson(
  fetchFn: typeof fetch,
  endpoint: string,
  apiKey: string,
  body: Record<string, unknown>,
  timeoutMs: number
): Promise<{ ok: boolean; status: number; data: GeminiApiResponse }> {
  const res = await fetchFn(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = ((await res.json().catch(() => ({}))) ?? {}) as GeminiApiResponse;
  return { ok: res.ok, status: res.status, data };
}

export async function runGeminiContentWithFallback(
  input: RunGeminiContentInput
): Promise<RunGeminiContentOutput> {
  const fetchFn = input.fetchFn ?? fetch;
  const models = input.models ?? GEMINI_TEXT_MODELS;
  const timeoutMs = input.timeoutMs ?? 25_000;
  const key = input.apiKey.trim();
  let primaryError = "";
  let fallbackError = "Gemini generation failed";

  for (const model of models) {
    try {
      const { ok, status, data } = await postGeminiJson(
        fetchFn,
        `${BASE_URL}/${model}:generateContent`,
        key,
        {
          contents: [{ parts: input.parts }],
          ...(input.generationConfig ? { generationConfig: input.generationConfig } : {}),
        },
        timeoutMs
      );
      if (!ok) {
        const msg = data.error?.message ?? `Model ${model} HTTP ${status}`;
        if (isFatalAuthError(status, msg)) throw new FatalGeminiAuthError(msg);
        if (status !== 404 && !primaryError) primaryError = msg;
        fallbackError = msg;
        continue;
      }

      const rawParts = data.candidates?.[0]?.content?.parts ?? [];
      const visibleText = rawParts
        .filter((p) => !p.thought && typeof p.text === "string")
        .map((p) => p.text ?? "")
        .join("");
      if (visibleText.trim().length > 0) {
        const promptTokens = data.usageMetadata?.promptTokenCount ?? 0;
        const completionTokens = data.usageMetadata?.candidatesTokenCount ?? 0;
        const totalTokens = data.usageMetadata?.totalTokenCount ?? promptTokens + completionTokens;
        return { text: visibleText, model, promptTokens, completionTokens, totalTokens };
      }
      fallbackError = `Model ${model} returned empty content`;
    } catch (err: unknown) {
      if (err instanceof FatalGeminiAuthError) throw new Error(err.message);
      const msg = err instanceof Error ? err.message : String(err);
      if (!primaryError) primaryError = msg;
      fallbackError = msg;
    }
  }
  throw new Error(`All Gemini models failed. Reason: ${primaryError || fallbackError}`);
}

export async function generateGeminiImageWithFallback(
  input: GenerateGeminiImageInput
): Promise<GenerateGeminiImageOutput> {
  const fetchFn = input.fetchFn ?? fetch;
  const timeoutMs = input.timeoutMs ?? 30_000;
  const key = input.apiKey.trim();
  let primaryError = "";
  let fallbackError = "Gemini image generation failed";

  for (const model of GEMINI_IMAGE_CONTENT_MODELS) {
    try {
      const { ok, status, data } = await postGeminiJson(
        fetchFn,
        `${BASE_URL}/${model}:generateContent`,
        key,
        {
          contents: [{ parts: [{ text: input.prompt }] }],
          generationConfig: { responseModalities: ["IMAGE"] },
        },
        timeoutMs
      );
      if (!ok) {
        const msg = data.error?.message ?? `Model ${model} HTTP ${status}`;
        if (isFatalAuthError(status, msg)) throw new FatalGeminiAuthError(msg);
        if (status !== 404 && !primaryError) primaryError = msg;
        fallbackError = msg;
        continue;
      }
      const imgPart = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
      if (imgPart?.inlineData?.data) return { base64Bytes: imgPart.inlineData.data, model };
    } catch (err: unknown) {
      if (err instanceof FatalGeminiAuthError) throw new Error(err.message);
      const msg = err instanceof Error ? err.message : String(err);
      if (!primaryError) primaryError = msg;
      fallbackError = msg;
    }
  }

  const legacy = await postGeminiJson(
    fetchFn,
    `${BASE_URL}/${IMAGEN_LEGACY_MODEL}:predict`,
    key,
    {
      instances: [{ prompt: input.prompt }],
      parameters: { sampleCount: 1, aspectRatio: "1:1", outputMimeType: "image/jpeg" },
    },
    timeoutMs
  );
  const b64 = legacy.data.predictions?.[0]?.bytesBase64Encoded;
  if (legacy.ok && b64) return { base64Bytes: b64, model: IMAGEN_LEGACY_MODEL };
  throw new Error(primaryError || legacy.data.error?.message || fallbackError);
}
