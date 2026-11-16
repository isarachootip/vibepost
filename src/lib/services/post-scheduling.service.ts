import { prisma } from "@/lib/prisma";
import { runGeminiContentWithFallback } from "@/lib/services/gemini-client.service";
import {
  createScheduledPostInputSchema,
  type PublishMode,
} from "@/lib/validations/post-schedule.schema";
import { validateScheduledTime } from "@/lib/services/schedule-time.service";
import { executeAutoPost } from "@/lib/services/publisher";
import { resolveUserWorkspaceRole } from "@/lib/repositories/posts/post-trash.repository";
import { attachMediaUrlsToPost } from "@/lib/repositories/posts/post-media.repository";

interface OpenRouterResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
  error?: { message?: string };
}

export async function generateAICaptionVariants(
  workspaceId: string,
  topic: string,
  variantCount: number,
  language: string = "Thai"
) {
  const role = await resolveUserWorkspaceRole(workspaceId);
  if (!role || role === "VIEWER") {
    return {
      success: false,
      error: "สิทธิ์ไม่เพียงพอ — Viewer ไม่สามารถสร้าง Post ได้",
      variants: [] as string[],
    };
  }

  const promptConfig = await prisma.promptConfig.findFirst({
    where: { workspaceId, isActive: true },
  });
  if (!promptConfig) {
    throw new Error("No active AI Prompt Configuration found. Please set it up in Settings.");
  }

  const systemPrompt = `You are an expert social media manager. Generate engaging social media captions based on the user's topic. IMPORTANT: Write ALL content in ${language} language only. Do NOT wrap the response in markdown blocks. Output exactly the requested number of variations separated by '|||'. Example: variation 1 ||| variation 2`;
  const userPrompt = `Topic: ${topic}\nLanguage: ${language}\nPlease generate ${variantCount} different variations of a social media caption for this topic in ${language}. Separate each variation strictly with '|||'.`;

  try {
    let textContent = "";

    if (promptConfig.provider === "GEMINI") {
      const out = await runGeminiContentWithFallback({
        apiKey: promptConfig.apiKey,
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
      });
      textContent = out.text;
    } else {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${promptConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      const data = (await response.json()) as OpenRouterResponse;
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to call OpenRouter API");
      }
      textContent = data.choices?.[0]?.message?.content ?? "";
    }

    const variants = textContent
      .split("|||")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return { success: true, variants };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI Generation failed";
    console.error("AI Generation Error:", message);
    return { success: false, error: message, variants: [] as string[] };
  }
}

export async function createAndPublishScheduledPost(
  workspaceId: string,
  data: {
    content: string;
    scheduledTime: Date | null;
    targetConnectionIds: string[];
    imageUrls?: string[];
    imageUrl?: string;
    publishMode?: PublishMode;
  }
) {
  const role = await resolveUserWorkspaceRole(workspaceId);
  if (!role || role === "VIEWER") {
    return { success: false, error: "สิทธิ์ไม่เพียงพอ — Viewer ไม่สามารถสร้าง Post ได้" };
  }

  const parsed = createScheduledPostInputSchema.safeParse({
    ...data,
    scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : null,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "ข้อมูลการตั้งโพสต์ไม่ถูกต้อง",
    };
  }

  const mode: PublishMode =
    parsed.data.publishMode ?? (parsed.data.scheduledTime ? "SCHEDULE" : "NOW");
  const timeValidation = validateScheduledTime(parsed.data.scheduledTime, mode);
  if (!timeValidation.valid) {
    return { success: false, error: timeValidation.error };
  }

  const uniqueTargetIds = Array.from(new Set(parsed.data.targetConnectionIds));
  const validTargetsCount = await prisma.socialConnection.count({
    where: { id: { in: uniqueTargetIds }, workspaceId },
  });
  if (validTargetsCount !== uniqueTargetIds.length) {
    return { success: false, error: "ช่องทางโซเชียลที่เลือกไม่ถูกต้องหรือไม่ได้อยู่ใน Workspace นี้" };
  }

  const allMediaUrls = [
    ...(parsed.data.imageUrls ?? []),
    ...(parsed.data.imageUrl ? [parsed.data.imageUrl] : []),
  ].filter(Boolean);

  try {
    const { isPostNow, finalTime } = timeValidation;

    const newPost = await prisma.post.create({
      data: {
        workspaceId,
        content: parsed.data.content,
        status: "SCHEDULED",
        scheduledTime: finalTime,
        targets: {
          create: uniqueTargetIds.map((id) => ({
            socialConnectionId: id,
            status: "SCHEDULED",
          })),
        },
      },
    });

    if (allMediaUrls.length > 0) {
      await attachMediaUrlsToPost(workspaceId, newPost.id, allMediaUrls, "APPROVED");
    }

    // When user clicks "Post Now", execute Auto-Post immediately without waiting for cron
    if (isPostNow) {
      await executeAutoPost({ postId: newPost.id });
    }

    return { success: true, isPostNow };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ไม่สามารถบันทึกโพสต์ได้";
    console.error("Create Post Error:", message);
    return { success: false, error: message };
  }
}
