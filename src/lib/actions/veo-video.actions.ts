"use server";

import crypto from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getActiveWorkspaceContext } from "./workspace";
import { getUserWorkspaceRole } from "./posts";
import { startVeoJobSchema } from "@/lib/validations/veo-video.schema";
import type { QuotaCheckResult } from "@/lib/services/veo-quota.service";
import {
  estimateVeoClipCostUsd,
  loadSourceImageForVeo,
  resolveVeoModelId,
  startVeoLongRunningOperation,
} from "@/lib/services/veo-client.service";
import {
  createWorkspaceLLMRunner,
  ensureEnglishMediaPrompt,
} from "@/lib/services/media-translator.service";
import { pollVeoJobsInDatabase } from "@/lib/services/veo-job-runner.service";
import {
  computeWorkspaceVideoQuota,
  listRecentWorkspaceVeoJobs,
  mapVeoJobRowToDTO,
  type VeoJobItemDTO as VeoJobRecordDTO,
} from "@/lib/repositories/veo-jobs.repository";

export type VeoJobItemDTO = VeoJobRecordDTO;

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vibepost.online";

export async function startVeoVideoJobAction(rawInput: unknown): Promise<{
  success: boolean;
  job?: VeoJobItemDTO;
  quota?: QuotaCheckResult;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" };

    const workspace = await getActiveWorkspaceContext();
    if (!workspace) return { success: false, error: "ไม่พบ Workspace ที่กำลังใช้งาน" };

    const role = await getUserWorkspaceRole(workspace.id);
    if (!role || role === "VIEWER") {
      return { success: false, error: "สิทธิ์ไม่เพียงพอ — เฉพาะ Admin และ Member เท่านั้นที่สร้างวิดีโอได้" };
    }

    const parsed = startVeoJobSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลคำขอไม่ถูกต้อง" };
    }

    const geminiConfig = await prisma.promptConfig.findFirst({
      where: { workspaceId: workspace.id, provider: "GEMINI", isActive: true },
    });
    if (!geminiConfig?.apiKey) {
      return {
        success: false,
        error: "ยังไม่ได้ตั้งค่า Google Gemini API Key ในหน้า Settings กรุณาผูกคีย์ก่อนใช้งาน Google Flow (Veo 3.1)",
      };
    }

    const quota = await computeWorkspaceVideoQuota(workspace.id, workspace.dailyVideoQuota);
    if (!quota.allowed) {
      return {
        success: false,
        quota,
        error: `ครบโควตาวิดีโอรายวันของ Workspace นี้แล้ว (${quota.used}/${quota.limit} คลิป — รีเซ็ตเที่ยงคืนเวลาไทย)`,
      };
    }

    const { prompt, modelTier, aspectRatio, durationSeconds, sourceImageUrl } = parsed.data;
    const englishReady = await ensureEnglishMediaPrompt(prompt, {
      llmRunner: createWorkspaceLLMRunner(geminiConfig),
    });
    const sourceImage = sourceImageUrl
      ? await loadSourceImageForVeo(sourceImageUrl, UPLOAD_DIR)
      : undefined;

    const modelName = resolveVeoModelId(modelTier);
    const { operationName } = await startVeoLongRunningOperation({
      apiKey: geminiConfig.apiKey,
      modelName,
      englishPrompt: englishReady.englishPrompt,
      aspectRatio,
      durationSeconds,
      sourceImage,
    });

    const created = await prisma.videoGenerationJob.create({
      data: {
        workspaceId: workspace.id,
        createdById: session.user.id ?? null,
        prompt,
        englishPrompt: englishReady.englishPrompt,
        modelName,
        aspectRatio,
        durationSeconds,
        sourceImageUrl: sourceImageUrl ?? null,
        operationName,
        status: "PROCESSING",
        estimatedCost: estimateVeoClipCostUsd(modelTier, durationSeconds),
      },
    });

    const nextQuota = await computeWorkspaceVideoQuota(workspace.id, workspace.dailyVideoQuota);
    revalidatePath("/dashboard/ai-studio");
    revalidatePath("/dashboard/multi-post");
    return { success: true, quota: nextQuota, job: mapVeoJobRowToDTO(created) };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการส่งคำขอไปยัง Google Veo 3.1",
    };
  }
}

export async function pollWorkspaceVeoJobsAction(): Promise<{
  success: boolean;
  jobs: VeoJobItemDTO[];
  quota?: QuotaCheckResult;
  hasGeminiKey?: boolean;
  error?: string;
}> {
  try {
    const workspace = await getActiveWorkspaceContext();
    if (!workspace) return { success: false, jobs: [], error: "Workspace not found" };

    const role = await getUserWorkspaceRole(workspace.id);
    if (!role) return { success: false, jobs: [], error: "Unauthorized" };

    await pollVeoJobsInDatabase(workspace.id);

    const [jobs, quota, geminiCount] = await Promise.all([
      listRecentWorkspaceVeoJobs(workspace.id),
      computeWorkspaceVideoQuota(workspace.id, workspace.dailyVideoQuota),
      prisma.promptConfig.count({
        where: { workspaceId: workspace.id, provider: "GEMINI", isActive: true },
      }),
    ]);

    return { success: true, jobs, quota, hasGeminiKey: geminiCount > 0 };
  } catch (err: unknown) {
    return {
      success: false,
      jobs: [],
      error: err instanceof Error ? err.message : "ไม่สามารถดึงสถานะงานสร้างวิดีโอได้",
    };
  }
}

export async function saveCuratedStockVideoAction(videoUrl: string): Promise<{
  success: boolean;
  fileUrl?: string;
  error?: string;
}> {
  try {
    const workspace = await getActiveWorkspaceContext();
    if (!workspace) return { success: false, error: "Workspace not found" };

    const role = await getUserWorkspaceRole(workspace.id);
    if (!role || role === "VIEWER") return { success: false, error: "สิทธิ์ไม่เพียงพอ" };

    if (!videoUrl.startsWith("https://images.pexels.com/video-files/")) {
      return { success: false, error: "ลิงก์วิดีโอสต็อกไม่ถูกต้อง" };
    }

    const res = await fetch(videoUrl);
    if (!res.ok) return { success: false, error: "ดาวน์โหลดวิดีโอสต็อกไม่สำเร็จ" };
    const buf = Buffer.from(await res.arrayBuffer());

    if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true });
    const fileName = `stock-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.mp4`;
    await writeFile(path.join(UPLOAD_DIR, fileName), buf);
    const fileUrl = `${PUBLIC_BASE_URL.replace(/\/+$/, "")}/api/files/${fileName}`;

    await prisma.mediaAsset.create({
      data: { workspaceId: workspace.id, fileName, fileUrl, fileType: "VIDEO", status: "APPROVED" },
    });
    return { success: true, fileUrl };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "บันทึกวิดีโอสต็อกไม่สำเร็จ" };
  }
}
