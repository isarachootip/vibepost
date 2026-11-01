import type { AIMediaType, VideoCategory } from "@/lib/validations/ai-media.schema";

const NON_LATIN_SCRIPT_REGEX =
  /[\u0E00-\u0E7F\u0600-\u06FF\u0400-\u04FF\u0900-\u097F\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/;

const STOP_AND_NOISE_WORDS = new Set([
  "and", "the", "with", "for", "from", "that", "this", "into", "over", "under",
  "about", "your", "our", "are", "was", "were", "have", "has", "will", "can",
  "high", "resolution", "cinematic", "stunning", "details", "detailed", "style",
  "photo", "photography", "image", "picture", "video", "footage", "beautiful",
  "scenic", "panoramic", "view", "shot", "explore", "charm", "gateway", "history",
  "very", "more", "most", "one", "also", "known", "many", "people", "place",
  "lighting", "natural", "warm", "golden", "hour", "ultra", "realistic",
]);

const VALID_CATEGORIES = new Set<VideoCategory>([
  "trending", "business", "coffee", "cooking", "technology", "fitness", "travel",
]);

export interface ParsedVisualPrompt {
  englishPrompt: string;
  keywords: string[];
  suggestedCategory: VideoCategory;
}

export function containsNonLatinScript(text: string): boolean {
  return NON_LATIN_SCRIPT_REGEX.test(text);
}

export function toCleanAsciiPrompt(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripMarkdownAndNoise(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/#[\p{L}\p{N}_]+/gu, " ")
    .replace(/[*_~`>|]/g, " ")
    .replace(/^\s*[-•\d.)]+\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function inferVideoCategoryFromEnglish(englishText: string): VideoCategory {
  const lower = englishText.toLowerCase();
  if (/(river|temple|pagoda|stupa|sea|beach|ocean|mountain|travel|trip|tourism|estuary|ancient|island|nature|park|sunset)/.test(lower)) {
    return "travel";
  }
  if (/(coffee|cafe|latte|espresso|barista|cappuccino)/.test(lower)) {
    return "coffee";
  }
  if (/(food|cooking|chef|kitchen|pizza|seafood|dish|meal|recipe|restaurant|bake)/.test(lower)) {
    return "cooking";
  }
  if (/(code|coding|tech|software|server|cyber|ai|computer|developer|digital|data)/.test(lower)) {
    return "technology";
  }
  if (/(gym|fitness|workout|yoga|exercise|health|dumbbell|running)/.test(lower)) {
    return "fitness";
  }
  if (/(office|business|marketing|meeting|analytics|finance|corporate|workspace)/.test(lower)) {
    return "business";
  }
  return "trending";
}

export function extractEnglishKeywords(englishText: string, maxCount: number = 4): string[] {
  const tokens = toCleanAsciiPrompt(englishText)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !/^\d+$/.test(word) && !STOP_AND_NOISE_WORDS.has(word));

  const unique: string[] = [];
  for (const token of tokens) {
    if (!unique.includes(token)) {
      unique.push(token);
    }
    if (unique.length >= maxCount) break;
  }
  return unique;
}

export function buildVisualExtractionPrompts(
  content: string,
  mediaType: AIMediaType,
  style: string = "photo"
): { systemPrompt: string; userPrompt: string } {
  const cleaned = stripMarkdownAndNoise(content).slice(0, 3500);
  const lengthHint =
    mediaType === "video"
      ? "Write a concise 15-35 word cinematic motion scene description in English."
      : `Write a rich 35-70 word visual scene description in English tailored for "${style}" style.`;

  const systemPrompt = [
    "You are an expert visual art director converting social media articles into accurate English text-to-image/video prompts.",
    "Read the entire source content carefully and depict the EXACT real-world subject, landmarks, geography, architecture, food, or product mentioned.",
    "CRITICAL RULES:",
    "1. Output strictly in English (ASCII Latin characters only).",
    "2. Do NOT generate generic portraits of women, men, or anime characters unless the source text is explicitly about a person.",
    "3. Do NOT include text overlays, logos, or watermarks in the scene.",
    `4. ${lengthHint}`,
    '5. Respond ONLY with valid JSON matching: {"visualPrompt":"...","keywords":["noun1","noun2","noun3","noun4"],"category":"travel|cooking|coffee|business|technology|fitness|trending"}',
  ].join("\n");

  const userPrompt = `Source Content:\n"""\n${cleaned}\n"""\n\nExtract the JSON visual prompt in English now:`;
  return { systemPrompt, userPrompt };
}

export function parseVisualPromptOutput(raw: string): ParsedVisualPrompt {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    try {
      const parsed: unknown = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
      if (parsed && typeof parsed === "object") {
        const record = parsed as Record<string, unknown>;
        const rawPrompt = typeof record.visualPrompt === "string" ? record.visualPrompt : "";
        const cleanPrompt = toCleanAsciiPrompt(rawPrompt);
        const rawKeywords = Array.isArray(record.keywords)
          ? record.keywords.filter((k): k is string => typeof k === "string")
          : [];
        const cleanKeywords = rawKeywords
          .map((k) => toCleanAsciiPrompt(k).toLowerCase().replace(/[^a-z0-9]/g, ""))
          .filter((k) => k.length >= 3);
        const rawCategory = typeof record.category === "string" ? record.category.toLowerCase() : "";
        const category: VideoCategory = VALID_CATEGORIES.has(rawCategory as VideoCategory)
          ? (rawCategory as VideoCategory)
          : inferVideoCategoryFromEnglish(cleanPrompt);

        if (cleanPrompt) {
          return {
            englishPrompt: cleanPrompt,
            keywords:
              cleanKeywords.length > 0 ? cleanKeywords.slice(0, 5) : extractEnglishKeywords(cleanPrompt),
            suggestedCategory: category,
          };
        }
      }
    } catch {
      // Fall through to plain-text recovery below
    }
  }

  const fallbackPrompt = toCleanAsciiPrompt(stripMarkdownAndNoise(trimmed));
  return {
    englishPrompt: fallbackPrompt,
    keywords: extractEnglishKeywords(fallbackPrompt),
    suggestedCategory: inferVideoCategoryFromEnglish(fallbackPrompt),
  };
}
