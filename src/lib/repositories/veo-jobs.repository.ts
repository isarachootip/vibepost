import { prisma } from "@/lib/prisma";
import {
  evaluateDailyVideoQuota,
  getBangkokDayRange,
  type QuotaCheckResult,
} from "@/lib/services/veo-quota.service";

export interface VeoJobItemDTO {
  id: string;
  prompt: string;
  englishPrompt: string;
  modelName: string;
  aspectRatio: string;
  durationSeconds: number;
  sourceImageUrl: string | null;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  errorMessage: string | null;
  mediaFileUrl: string | null;
  estimatedCost: number;
  createdAt: string;
}

export function mapVeoJobRowToDTO(row: {
  id: string;
  prompt: string;
  englishPrompt: string;
  modelName: string;
  aspectRatio: string;
  durationSeconds: number;
  sourceImageUrl: string | null;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  errorMessage: string | null;
  mediaFileUrl: string | null;
  estimatedCost: number;
  createdAt: Date;
}): VeoJobItemDTO {
  return {
    id: row.id,
    prompt: row.prompt,
    englishPrompt: row.englishPrompt,
    modelName: row.modelName,
    aspectRatio: row.aspectRatio,
    durationSeconds: row.durationSeconds,
    sourceImageUrl: row.sourceImageUrl,
    status: row.status,
    errorMessage: row.errorMessage,
    mediaFileUrl: row.mediaFileUrl,
    estimatedCost: row.estimatedCost,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function computeWorkspaceVideoQuota(
  workspaceId: string,
  dailyLimit: number
): Promise<QuotaCheckResult> {
  const { start, end } = getBangkokDayRange();
  const usedToday = await prisma.videoGenerationJob.count({
    where: {
      workspaceId,
      status: { in: ["PROCESSING", "COMPLETED"] },
      createdAt: { gte: start, lt: end },
    },
  });
  return evaluateDailyVideoQuota(usedToday, dailyLimit);
}

export async function listRecentWorkspaceVeoJobs(
  workspaceId: string
): Promise<VeoJobItemDTO[]> {
  const rows = await prisma.videoGenerationJob.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return rows.map(mapVeoJobRowToDTO);
}
