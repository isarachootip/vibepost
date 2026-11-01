import { z } from "zod";

export const mediaTypeSchema = z.enum(["image", "video"]);
export type AIMediaType = z.infer<typeof mediaTypeSchema>;

export const imageProviderSchema = z.enum(["FREE", "GEMINI", "OPENAI"]);
export type AIImageProvider = z.infer<typeof imageProviderSchema>;

export const videoCategorySchema = z.enum([
  "trending",
  "business",
  "coffee",
  "cooking",
  "technology",
  "fitness",
  "travel",
]);
export type VideoCategory = z.infer<typeof videoCategorySchema>;

export const extractVisualPromptSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "กรุณาระบุเนื้อหาสำหรับสกัด Visual Prompt")
    .max(12000, "เนื้อหายาวเกินขีดจำกัด"),
  mediaType: mediaTypeSchema,
  style: z.string().trim().optional(),
});

export type ExtractVisualPromptInput = z.infer<typeof extractVisualPromptSchema>;

export const generateImageInputSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "โปรดป้อนรายละเอียดรูปภาพ (Prompt)")
    .max(4000, "Prompt ยาวเกินขีดจำกัด"),
  style: z.string().trim().default("photo"),
  provider: imageProviderSchema.default("FREE"),
});

export const generateVideoInputSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "โปรดระบุรายละเอียดวิดีโอหรือคีย์เวิร์ด")
    .max(4000, "Prompt ยาวเกินขีดจำกัด"),
  category: z.string().trim().default("trending"),
});

export interface WorkspaceLLMConfig {
  provider: string;
  apiKey: string;
}

export interface LLMRunOutput {
  text: string;
  provider: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface MediaGenerationMetadata {
  resolvedEnglishPrompt: string;
  keywords: string[];
  requestedProvider: string;
  actualProvider: string;
  actualModel: string;
  usedFallback: boolean;
  fallbackReason?: string;
}
