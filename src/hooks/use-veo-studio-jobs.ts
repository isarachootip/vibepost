"use client";

import { useState, useEffect, useCallback } from "react";
import {
  pollWorkspaceVeoJobsAction,
  startVeoVideoJobAction,
  type VeoJobItemDTO,
} from "@/lib/actions/veo-video.actions";
import type { QuotaCheckResult } from "@/lib/services/veo-quota.service";
import type {
  VeoAspectRatio,
  VeoDurationSeconds,
  VeoModelTier,
} from "@/lib/validations/veo-video.schema";

export function useVeoStudioJobs(isOpen: boolean, setError: (msg: string) => void) {
  const [veoJobs, setVeoJobs] = useState<VeoJobItemDTO[]>([]);
  const [quota, setQuota] = useState<QuotaCheckResult | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState(true);
  const [polling, setPolling] = useState(false);
  const [submittingVeo, setSubmittingVeo] = useState(false);

  const refreshVeoJobs = useCallback(async () => {
    setPolling(true);
    try {
      const res = await pollWorkspaceVeoJobsAction();
      if (res.success) {
        setVeoJobs(res.jobs);
        if (res.quota) setQuota(res.quota);
        if (typeof res.hasGeminiKey === "boolean") setHasGeminiKey(res.hasGeminiKey);
      }
    } finally {
      setPolling(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void refreshVeoJobs();
    }
  }, [isOpen, refreshVeoJobs]);

  const hasProcessingJob = veoJobs.some((j) => j.status === "PROCESSING");
  useEffect(() => {
    if (!isOpen || !hasProcessingJob) return;
    const id = setInterval(() => void refreshVeoJobs(), 8_000);
    return () => clearInterval(id);
  }, [isOpen, hasProcessingJob, refreshVeoJobs]);

  const startVeoJob = useCallback(
    async (params: {
      prompt: string;
      sourceImageUrl: string | null;
      modelTier: VeoModelTier;
      aspectRatio: VeoAspectRatio;
      durationSeconds: VeoDurationSeconds;
    }) => {
      setSubmittingVeo(true);
      setError("");
      try {
        const res = await startVeoVideoJobAction({
          prompt: params.prompt,
          modelTier: params.modelTier,
          aspectRatio: params.aspectRatio,
          durationSeconds: params.durationSeconds,
          sourceImageUrl: params.sourceImageUrl || undefined,
        });
        if (res.success && res.job) {
          setVeoJobs((prev) => [res.job!, ...prev]);
          if (res.quota) setQuota(res.quota);
        } else {
          if (res.quota) setQuota(res.quota);
          setError(res.error || "ไม่สามารถเริ่มสร้างวิดีโอ Google Veo 3.1 ได้");
        }
      } finally {
        setSubmittingVeo(false);
      }
    },
    [setError]
  );

  return {
    veoJobs,
    quota,
    hasGeminiKey,
    polling,
    submittingVeo,
    refreshVeoJobs,
    startVeoJob,
  };
}
