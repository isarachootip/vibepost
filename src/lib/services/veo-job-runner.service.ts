import { prisma } from "@/lib/prisma";
import {
  checkVeoOperationState,
  downloadVeoVideoToUploads,
} from "./veo-client.service";
import {
  advanceProcessingVeoJobs,
  type VeoJobPollerStore,
} from "./veo-job-poller.service";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vibepost.online";
const STALE_TIMEOUT_MS = 30 * 60 * 1000;

const prismaVeoPollerStore: VeoJobPollerStore = {
  async listProcessingJobs(workspaceId) {
    const staleCutoff = new Date(Date.now() - STALE_TIMEOUT_MS);
    await prisma.videoGenerationJob.updateMany({
      where: {
        status: "PROCESSING",
        createdAt: { lt: staleCutoff },
        ...(workspaceId ? { workspaceId } : {}),
      },
      data: {
        status: "FAILED",
        errorMessage: "หมดเวลารอผลจาก Google Veo (เกิน 30 นาที)",
      },
    });

    const rows = await prisma.videoGenerationJob.findMany({
      where: {
        status: "PROCESSING",
        operationName: { not: null },
        ...(workspaceId ? { workspaceId } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    return rows
      .filter((r): r is typeof r & { operationName: string } => Boolean(r.operationName))
      .map((r) => ({
        id: r.id,
        workspaceId: r.workspaceId,
        operationName: r.operationName,
        modelName: r.modelName,
        estimatedCost: r.estimatedCost,
      }));
  },

  async getWorkspaceGeminiKey(workspaceId) {
    const cfg = await prisma.promptConfig.findFirst({
      where: { workspaceId, provider: "GEMINI", isActive: true },
    });
    return cfg?.apiKey ?? null;
  },

  async completeJobWithMedia(params) {
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.videoGenerationJob.updateMany({
        where: { id: params.jobId, status: "PROCESSING" },
        data: { status: "COMPLETED", mediaFileUrl: params.publicUrl, errorMessage: null },
      });
      if (claimed.count === 0) return;

      const asset = await tx.mediaAsset.create({
        data: {
          workspaceId: params.workspaceId,
          fileName: params.fileName,
          fileUrl: params.publicUrl,
          fileType: "VIDEO",
          status: "APPROVED",
        },
      });

      await tx.videoGenerationJob.update({
        where: { id: params.jobId },
        data: { mediaAssetId: asset.id },
      });

      await tx.aIUsageLog.create({
        data: {
          workspaceId: params.workspaceId,
          actionType: "VIDEO",
          provider: "GEMINI",
          modelName: params.modelName,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          estimatedCost: params.estimatedCost,
        },
      });
    });
  },

  async failJob(jobId, errorMessage) {
    await prisma.videoGenerationJob.updateMany({
      where: { id: jobId, status: "PROCESSING" },
      data: { status: "FAILED", errorMessage },
    });
  },
};

export async function pollVeoJobsInDatabase(workspaceId?: string) {
  return advanceProcessingVeoJobs({
    workspaceId,
    store: prismaVeoPollerStore,
    checkOperation: ({ apiKey, operationName }) =>
      checkVeoOperationState({ apiKey, operationName }),
    downloadVideoToUploads: ({ videoUri, apiKey }) =>
      downloadVeoVideoToUploads({
        videoUri,
        apiKey,
        uploadDir: UPLOAD_DIR,
        publicBaseUrl: PUBLIC_BASE_URL,
      }),
  });
}

const globalForVeoPoller = globalThis as unknown as {
  __vibepostVeoPollerStarted?: boolean;
  __vibepostVeoPollerBusy?: boolean;
};

export function ensureVeoBackgroundPollerStarted(): void {
  if (globalForVeoPoller.__vibepostVeoPollerStarted) return;
  globalForVeoPoller.__vibepostVeoPollerStarted = true;

  const timer = setInterval(async () => {
    if (globalForVeoPoller.__vibepostVeoPollerBusy) return;
    globalForVeoPoller.__vibepostVeoPollerBusy = true;
    try {
      await pollVeoJobsInDatabase();
    } catch (err: unknown) {
      console.error("[VeoPoller] Background poll error:", err);
    } finally {
      globalForVeoPoller.__vibepostVeoPollerBusy = false;
    }
  }, 20_000);

  if (typeof timer.unref === "function") {
    timer.unref();
  }
}
