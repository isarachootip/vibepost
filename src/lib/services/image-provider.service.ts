import type {
  AIImageProvider,
  MediaGenerationMetadata,
} from "@/lib/validations/ai-media.schema";

export interface ExecuteImageGenInput {
  englishPrompt: string;
  keywords: string[];
  style: string;
  requestedProvider: AIImageProvider;
  geminiApiKey: string | null;
  openaiApiKey: string | null;
}

export interface ImageStorageAdapters {
  fetchFn?: typeof fetch;
  saveBase64Jpg: (base64Bytes: string) => Promise<string>;
  downloadRemoteJpg: (remoteUrl: string) => Promise<string>;
}

export interface ExecuteImageGenOutput {
  imageUrl: string;
  estimatedCost: number;
  meta: MediaGenerationMetadata;
}

export async function executeImageGeneration(
  input: ExecuteImageGenInput,
  adapters: ImageStorageAdapters
): Promise<ExecuteImageGenOutput> {
  const fetchFn = adapters.fetchFn ?? fetch;
  const enhancedPrompt = `${input.englishPrompt}, style: ${input.style}, high resolution, realistic details, no text watermark`;
  const fallbackReasons: string[] = [];

  // 1. Determine whether to attempt Gemini Imagen 4
  const shouldTryGemini =
    input.requestedProvider === "GEMINI" ||
    (input.requestedProvider === "FREE" && Boolean(input.geminiApiKey));

  if (input.requestedProvider === "GEMINI" && !input.geminiApiKey) {
    fallbackReasons.push("ไม่ได้ตั้งค่า Gemini API Key จึงสลับมาใช้โมเดลสำรองฟรี");
  } else if (shouldTryGemini && input.geminiApiKey) {
    try {
      const response = await fetchFn(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${input.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt: enhancedPrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "1:1",
              outputMimeType: "image/jpeg",
            },
          }),
        }
      );
      const data = (await response.json()) as {
        predictions?: Array<{ bytesBase64Encoded?: string }>;
        error?: { message?: string };
      };
      const base64Bytes = data.predictions?.[0]?.bytesBase64Encoded;
      if (!response.ok || !base64Bytes) {
        throw new Error(data.error?.message ?? "Gemini Imagen 4 API error");
      }

      const imageUrl = await adapters.saveBase64Jpg(base64Bytes);
      return {
        imageUrl,
        estimatedCost: 0.03,
        meta: {
          resolvedEnglishPrompt: input.englishPrompt,
          keywords: input.keywords,
          requestedProvider: input.requestedProvider,
          actualProvider: "GEMINI",
          actualModel: "imagen-4.0-fast-generate-001",
          usedFallback: false,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Imagen error";
      console.warn("Gemini Imagen failed, falling back to free model:", msg);
      fallbackReasons.push(
        input.requestedProvider === "GEMINI"
          ? "Gemini Imagen เรียกไม่สำเร็จ (โควตาหรือสิทธิ์คีย์ไม่รองรับ) จึงสลับไปใช้โมเดลสำรองฟรี"
          : "คีย์ Gemini ไม่รองรับ Imagen 4 จึงสลับไปใช้โมเดลสำรองฟรี (Pollinations.ai)"
      );
    }
  }

  // 2. Attempt OpenAI DALL-E 3 if explicitly requested
  if (input.requestedProvider === "OPENAI") {
    if (!input.openaiApiKey) {
      fallbackReasons.push("ไม่ได้ตั้งค่า OpenAI API Key จึงสลับมาใช้โมเดลสำรองฟรี");
    } else {
      try {
        const response = await fetchFn("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${input.openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1,
            size: "1024x1024",
          }),
        });
        const data = (await response.json()) as {
          data?: Array<{ url?: string }>;
          error?: { message?: string };
        };
        const remoteUrl = data.data?.[0]?.url;
        if (!response.ok || !remoteUrl) {
          throw new Error(data.error?.message ?? "DALL-E 3 API error");
        }

        const imageUrl = await adapters.downloadRemoteJpg(remoteUrl);
        return {
          imageUrl,
          estimatedCost: 0.04,
          meta: {
            resolvedEnglishPrompt: input.englishPrompt,
            keywords: input.keywords,
            requestedProvider: input.requestedProvider,
            actualProvider: "OPENAI",
            actualModel: "dall-e-3",
            usedFallback: false,
          },
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "DALL-E error";
        console.warn("DALL-E failed, falling back to free model:", msg);
        fallbackReasons.push("OpenAI DALL-E 3 เรียกไม่สำเร็จ จึงสลับไปใช้โมเดลสำรองฟรี");
      }
    }
  }

  // 3. Free AI Model (Pollinations.ai) using English prompt
  try {
    const randomSeed = Math.floor(Math.random() * 1_000_000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${randomSeed}&nologo=true&private=true`;
    const imageUrl = await adapters.downloadRemoteJpg(pollinationsUrl);

    return {
      imageUrl,
      estimatedCost: 0,
      meta: {
        resolvedEnglishPrompt: input.englishPrompt,
        keywords: input.keywords,
        requestedProvider: input.requestedProvider,
        actualProvider: "FREE",
        actualModel: "pollinations.ai",
        usedFallback: fallbackReasons.length > 0,
        fallbackReason: fallbackReasons[0],
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Pollinations error";
    console.warn("Pollinations.ai failed, falling back to LoremFlickr:", msg);
    fallbackReasons.push("Pollinations.ai ติดจำกัดความถี่ จึงดึงภาพสำรองจากคีย์เวิร์ดเนื้อหา");
  }

  // 4. Last-resort keyword stock fallback (LoremFlickr) with English keywords
  const tags =
    input.keywords
      .map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, ""))
      .filter((k) => k.length >= 3)
      .slice(0, 3)
      .join(",") || "travel,landscape";

  const fallbackUrl = `https://loremflickr.com/1024/1024/${tags}`;
  const imageUrl = await adapters.downloadRemoteJpg(fallbackUrl);

  return {
    imageUrl,
    estimatedCost: 0,
    meta: {
      resolvedEnglishPrompt: input.englishPrompt,
      keywords: input.keywords,
      requestedProvider: input.requestedProvider,
      actualProvider: "FREE",
      actualModel: "loremflickr",
      usedFallback: true,
      fallbackReason: fallbackReasons.join(" — "),
    },
  };
}
