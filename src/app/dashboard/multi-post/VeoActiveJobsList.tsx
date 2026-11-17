"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { VeoJobItemDTO } from "@/lib/actions/veo-video.actions";
import type { MediaGenerationMetadata } from "@/lib/validations/ai-media.schema";
import { AlertCircle, CheckCircle2, Clock, Loader2, RefreshCw } from "lucide-react";

interface VeoActiveJobsListProps {
  jobs: VeoJobItemDTO[];
  polling: boolean;
  onRefresh: () => void;
  onSelectCompletedVideo: (url: string, meta: MediaGenerationMetadata) => void;
}

export function VeoActiveJobsList({
  jobs,
  polling,
  onRefresh,
  onSelectCompletedVideo,
}: VeoActiveJobsListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-6 border border-dashed border-border/60 rounded-2xl text-xs text-muted-foreground">
        ยังไม่มีรายการสร้างวิดีโอใน Workspace นี้ — สั่งสร้างด้านบนแล้วสามารถปิดหน้าต่างไปทำงานอื่นระหว่างรอได้ครับ
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          คิวงานสร้างวิดีโอเบื้องหลัง (Background Jobs)
        </h4>
        <button
          type="button"
          onClick={onRefresh}
          disabled={polling}
          className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${polling ? "animate-spin" : ""}`} />
          เช็คสถานะล่าสุด
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
        {jobs.map((job) => {
          const isFast = job.modelName.includes("fast");
          return (
            <div
              key={job.id}
              className="neu-raised rounded-2xl p-3.5 border border-border/60 flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[var(--surface-recessed)] border border-border/60 text-foreground">
                    {isFast ? "⚡ Veo 3.1 Fast" : "🎬 Veo 3.1 Std"} • {job.aspectRatio} • {job.durationSeconds}s
                  </span>

                  {job.status === "PROCESSING" && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> กำลังเรนเดอร์...
                    </span>
                  )}
                  {job.status === "COMPLETED" && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> สำเร็จ
                    </span>
                  )}
                  {job.status === "FAILED" && (
                    <span className="text-[10px] font-bold text-destructive inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> ล้มเหลว
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-foreground line-clamp-2">{job.prompt}</p>
              </div>

              {job.status === "PROCESSING" && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                  ใช้เวลาประมาณ 30–90 วินาที ระบบดึงไฟล์ให้อัตโนมัติแม้ปิดหน้าต่างนี้
                </div>
              )}

              {job.status === "FAILED" && (
                <div className="p-2.5 rounded-xl bg-destructive/12 border border-destructive/25 text-[11px] text-destructive font-semibold">
                  {job.errorMessage || "Google Veo ไม่สามารถสร้างคลิปนี้ได้"}
                </div>
              )}

              {job.status === "COMPLETED" && job.mediaFileUrl && (
                <div className="space-y-2">
                  <video
                    src={job.mediaFileUrl}
                    controls
                    className="w-full h-32 rounded-xl bg-black object-contain border border-border/60"
                  />
                  <Button
                    type="button"
                    variant="tactile"
                    onClick={() =>
                      onSelectCompletedVideo(job.mediaFileUrl!, {
                        resolvedEnglishPrompt: job.englishPrompt,
                        keywords: [],
                        requestedProvider: "GEMINI",
                        actualProvider: "GEMINI",
                        actualModel: job.modelName,
                        usedFallback: false,
                      })
                    }
                    className="w-full h-9 rounded-xl text-xs font-bold"
                  >
                    ✅ นำคลิปนี้ไปโพสต์
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
