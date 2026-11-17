import type { VeoOperationCheckResult } from "./veo-client.service";

export interface ProcessingJobRecord {
  id: string;
  workspaceId: string;
  operationName: string;
  modelName: string;
  estimatedCost: number;
}

export interface VeoJobPollerStore {
  listProcessingJobs: (workspaceId?: string) => Promise<ProcessingJobRecord[]>;
  getWorkspaceGeminiKey: (workspaceId: string) => Promise<string | null>;
  completeJobWithMedia: (params: {
    jobId: string;
    workspaceId: string;
    fileName: string;
    publicUrl: string;
    modelName: string;
    estimatedCost: number;
  }) => Promise<void>;
  failJob: (jobId: string, errorMessage: string) => Promise<void>;
}

export interface AdvanceVeoJobsParams {
  workspaceId?: string;
  store: VeoJobPollerStore;
  checkOperation: (params: {
    apiKey: string;
    operationName: string;
  }) => Promise<VeoOperationCheckResult>;
  downloadVideoToUploads: (params: {
    videoUri: string;
    apiKey: string;
  }) => Promise<{ fileName: string; publicUrl: string }>;
}

export async function advanceProcessingVeoJobs({
  workspaceId,
  store,
  checkOperation,
  downloadVideoToUploads,
}: AdvanceVeoJobsParams): Promise<{ checked: number; completed: number; failed: number }> {
  const activeJobs = await store.listProcessingJobs(workspaceId);
  if (activeJobs.length === 0) {
    return { checked: 0, completed: 0, failed: 0 };
  }

  let completed = 0;
  let failed = 0;
  const keyCache = new Map<string, string | null>();

  for (const job of activeJobs) {
    if (!keyCache.has(job.workspaceId)) {
      keyCache.set(job.workspaceId, await store.getWorkspaceGeminiKey(job.workspaceId));
    }
    const apiKey = keyCache.get(job.workspaceId) ?? null;

    if (!apiKey) {
      await store.failJob(job.id, "ไม่พบ Gemini API Key ที่เปิดใช้งานใน Workspace นี้");
      failed++;
      continue;
    }

    try {
      const state = await checkOperation({ apiKey, operationName: job.operationName });
      if (state.status === "PROCESSING") {
        continue;
      }

      if (state.status === "FAILED") {
        await store.failJob(job.id, state.errorMessage);
        failed++;
        continue;
      }

      const saved = await downloadVideoToUploads({
        videoUri: state.videoUri,
        apiKey,
      });

      await store.completeJobWithMedia({
        jobId: job.id,
        workspaceId: job.workspaceId,
        fileName: saved.fileName,
        publicUrl: saved.publicUrl,
        modelName: job.modelName,
        estimatedCost: job.estimatedCost,
      });
      completed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดระหว่างดึงไฟล์วิดีโอ";
      await store.failJob(job.id, msg);
      failed++;
    }
  }

  return { checked: activeJobs.length, completed, failed };
}
