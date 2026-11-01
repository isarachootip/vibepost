"use server";

import { prisma } from "@/lib/prisma";
import { getActiveWorkspaceContext } from "./workspace";
import { getUserWorkspaceRole } from "./posts";
import {
  extractVisualPromptSchema,
  type ExtractVisualPromptInput,
  type VideoCategory,
} from "@/lib/validations/ai-media.schema";
import {
  createWorkspaceLLMRunner,
  synthesizeEnglishVisualPrompt,
} from "@/lib/services/media-translator.service";

export type ExtractVisualPromptResponse =
  | {
      success: true;
      englishPrompt: string;
      keywords: string[];
      suggestedCategory: VideoCategory;
      usedFallbackTranslator: boolean;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server Action: Reads full article/caption text and extracts an accurate
 * English Visual Prompt + keywords for AI Image or Video generation.
 */
export async function extractVisualPromptAction(
  rawInput: ExtractVisualPromptInput
): Promise<ExtractVisualPromptResponse> {
  try {
    const workspace = await getActiveWorkspaceContext();
    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    const role = await getUserWorkspaceRole(workspace.id);
    if (!role || role === "VIEWER") {
      return {
        success: false,
        error: "สิทธิ์ไม่เพียงพอ — Viewer ไม่สามารถสกัด Prompt ด้วย AI ได้",
      };
    }

    const parsed = extractVisualPromptSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message ?? "ข้อมูลสำหรับสกัด Prompt ไม่ถูกต้อง",
      };
    }

    const promptConfig = await prisma.promptConfig.findFirst({
      where: { workspaceId: workspace.id, isActive: true },
      select: { provider: true, apiKey: true },
    });

    const llmRunner = createWorkspaceLLMRunner(promptConfig);
    const synthesized = await synthesizeEnglishVisualPrompt(parsed.data, { llmRunner });

    if (synthesized.usage) {
      try {
        await prisma.aIUsageLog.create({
          data: {
            workspaceId: workspace.id,
            actionType: "ARTICLE",
            provider: synthesized.usage.provider,
            modelName: synthesized.usage.modelName,
            promptTokens: synthesized.usage.promptTokens,
            completionTokens: synthesized.usage.completionTokens,
            totalTokens: synthesized.usage.totalTokens,
            estimatedCost: synthesized.usage.estimatedCost,
          },
        });
      } catch (logErr: unknown) {
        console.error("Failed to record visual prompt extraction usage:", logErr);
      }
    }

    return {
      success: true,
      englishPrompt: synthesized.englishPrompt,
      keywords: synthesized.keywords,
      suggestedCategory: synthesized.suggestedCategory,
      usedFallbackTranslator: synthesized.usedFallbackTranslator,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสกัด Visual Prompt";
    return { success: false, error: message };
  }
}
