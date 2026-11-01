import type { AIMediaType, LLMRunOutput, VideoCategory } from "@/lib/validations/ai-media.schema";
import {
  buildVisualExtractionPrompts,
  containsNonLatinScript,
  extractEnglishKeywords,
  inferVideoCategoryFromEnglish,
  parseVisualPromptOutput,
  stripMarkdownAndNoise,
  toCleanAsciiPrompt,
} from "@/lib/services/visual-prompt.service";
import { createWorkspaceLLMRunner, type LLMRunnerFn } from "@/lib/services/llm-prompt-runner.service";

export { createWorkspaceLLMRunner, type LLMRunnerFn };
export type FallbackTranslatorFn = (text: string) => Promise<string>;

export interface VisualTranslatorDeps {
  llmRunner: LLMRunnerFn | null;
  fallbackTranslator?: FallbackTranslatorFn;
}

export interface SynthesizedVisualPrompt {
  englishPrompt: string;
  keywords: string[];
  suggestedCategory: VideoCategory;
  usedFallbackTranslator: boolean;
  usage?: LLMRunOutput;
}

export async function defaultFreeTranslateToEnglish(text: string): Promise<string> {
  const snippet = stripMarkdownAndNoise(text).slice(0, 480);
  if (!snippet) return "";

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(snippet)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6_000) });
    if (res.ok) {
      const json: unknown = await res.json();
      if (Array.isArray(json) && Array.isArray(json[0])) {
        const segments = (json[0] as unknown[])
          .map((seg) => (Array.isArray(seg) && typeof seg[0] === "string" ? seg[0] : ""))
          .join(" ");
        const clean = toCleanAsciiPrompt(segments);
        if (clean) return clean;
      }
    }
  } catch {
    // Secondary fallback below
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(snippet.slice(0, 350))}&langpair=th|en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6_000) });
    if (res.ok) {
      const json = (await res.json()) as { responseData?: { translatedText?: string } };
      const clean = toCleanAsciiPrompt(json.responseData?.translatedText ?? "");
      if (clean) return clean;
    }
  } catch {
    // Graceful degradation
  }

  return toCleanAsciiPrompt(snippet);
}

export async function synthesizeEnglishVisualPrompt(
  input: { content: string; mediaType: AIMediaType; style?: string },
  deps: VisualTranslatorDeps
): Promise<SynthesizedVisualPrompt> {
  const translator = deps.fallbackTranslator ?? defaultFreeTranslateToEnglish;

  if (deps.llmRunner) {
    try {
      const { systemPrompt, userPrompt } = buildVisualExtractionPrompts(
        input.content,
        input.mediaType,
        input.style ?? "photo"
      );
      const usage = await deps.llmRunner(systemPrompt, userPrompt);
      const parsed = parseVisualPromptOutput(usage.text);
      if (parsed.englishPrompt && !containsNonLatinScript(parsed.englishPrompt)) {
        return {
          englishPrompt: parsed.englishPrompt,
          keywords: parsed.keywords.length > 0 ? parsed.keywords : ["scenic", "photography"],
          suggestedCategory: parsed.suggestedCategory,
          usedFallbackTranslator: false,
          usage,
        };
      }
    } catch {
      // Fall through to free translator
    }
  }

  const translated = await translator(input.content);
  const cleanEnglish = toCleanAsciiPrompt(translated) || "Scenic editorial photography, natural daylight";
  const keywords = extractEnglishKeywords(cleanEnglish);

  return {
    englishPrompt: cleanEnglish,
    keywords: keywords.length > 0 ? keywords : ["editorial", "lifestyle"],
    suggestedCategory: inferVideoCategoryFromEnglish(cleanEnglish),
    usedFallbackTranslator: true,
  };
}

export async function ensureEnglishMediaPrompt(
  prompt: string,
  deps: VisualTranslatorDeps
): Promise<{
  englishPrompt: string;
  keywords: string[];
  usedFallbackTranslator: boolean;
  usage?: LLMRunOutput;
}> {
  const cleaned = stripMarkdownAndNoise(prompt);
  if (!containsNonLatinScript(cleaned)) {
    const ascii = toCleanAsciiPrompt(cleaned);
    const keywords = extractEnglishKeywords(ascii);
    return {
      englishPrompt: ascii || "Scenic editorial photography",
      keywords: keywords.length > 0 ? keywords : ["editorial", "lifestyle"],
      usedFallbackTranslator: false,
    };
  }

  const synthesized = await synthesizeEnglishVisualPrompt(
    { content: cleaned, mediaType: "image" },
    deps
  );
  return {
    englishPrompt: synthesized.englishPrompt,
    keywords: synthesized.keywords,
    usedFallbackTranslator: synthesized.usedFallbackTranslator,
    usage: synthesized.usage,
  };
}
