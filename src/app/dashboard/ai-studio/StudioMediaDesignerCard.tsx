"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { MediaGenerationMetadata } from "@/lib/validations/ai-media.schema";
import { StudioPublishExportZone } from "./StudioPublishExportZone";
import {
  AlertTriangle,
  Check,
  Clapperboard,
  Film,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

interface StudioMediaDesignerCardProps {
  mediaUrl: string | null;
  mediaType: "image" | "video";
  mediaMeta: MediaGenerationMetadata | null;
  hasActiveContent: boolean;
  savingDraft: boolean;
  onClearMedia: () => void;
  onOpenImageModal: () => void;
  onOpenVideoModal: () => void;
  onAnimateCurrentImage: () => void;
  onOpenAutoPostModal: () => void;
  onSaveDraft: () => void;
  onSendToPublisher: (mode: "single" | "video") => void;
}

export function StudioMediaDesignerCard({
  mediaUrl,
  mediaType,
  mediaMeta,
  hasActiveContent,
  savingDraft,
  onClearMedia,
  onOpenImageModal,
  onOpenVideoModal,
  onAnimateCurrentImage,
  onOpenAutoPostModal,
  onSaveDraft,
  onSendToPublisher,
}: StudioMediaDesignerCardProps) {
  return (
    <div className="lg:col-span-5 neu-raised neu-grain rounded-3xl p-6 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
          <Film className="w-5 h-5 text-teal-500" />
          <h2 className="font-display font-bold text-foreground text-lg">
            2. ออกแบบรูปภาพหรือวิดีโอ (Google Flow)
          </h2>
        </div>

        {mediaUrl ? (
          <div className="space-y-4 animate-in zoom-in-95">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border/60 shadow-md bg-black">
              {mediaType === "video" ? (
                <video src={mediaUrl} className="w-full h-full object-contain" controls autoPlay loop muted />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={mediaUrl} alt="AI generated visual" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={onClearMedia}
                className="absolute top-3 right-3 bg-destructive text-destructive-foreground p-2 rounded-full shadow-lg"
                aria-label="ลบสื่อที่แนบ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {mediaMeta?.usedFallback && (
              <div className="p-3 bg-amber-500/12 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-300 font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">ใช้โมเดลสำรอง: {mediaMeta.actualModel}</span>
                  <span className="text-[11px] opacity-90">{mediaMeta.fallbackReason}</span>
                </div>
              </div>
            )}

            <div className="p-3 bg-emerald-500/12 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              แนบไฟล์{mediaType === "video" ? "วิดีโอ" : "รูปภาพ"}สำเร็จแล้ว! พร้อมส่งออกเพื่อโพสต์
            </div>

            {mediaType === "image" && (
              <Button
                type="button"
                variant="tactile"
                onClick={onAnimateCurrentImage}
                className="w-full h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <Clapperboard className="w-4 h-4" />
                🎬 สร้างวิดีโอเคลื่อนไหวจากภาพนี้ด้วย Google Flow (Veo 3.1)
              </Button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="neu"
                onClick={onOpenImageModal}
                className="font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-primary" /> เจนรูปใหม่
              </Button>
              <Button
                type="button"
                variant="neu"
                onClick={onOpenVideoModal}
                className="font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5 text-teal-500" /> สตูดิโอวิดีโอ Veo 3.1
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border/70 rounded-2xl p-8 neu-pressed flex flex-col items-center justify-center text-center text-muted-foreground min-h-[350px]">
            <ImageIcon className="w-12 h-12 opacity-40 mb-3" />
            <p className="font-display font-bold text-foreground/85 text-sm">เนรมิตสื่อประกอบบทความ</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mb-5">
              สร้างรูปภาพด้วย Imagen หรือสร้างคลิปวิดีโอพร้อมเสียงด้วย Google Flow (Veo 3.1)
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <Button
                variant="neu"
                onClick={onOpenImageModal}
                className="font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-primary" /> 🎨 เจนรูป AI
              </Button>
              <Button
                variant="neu"
                onClick={onOpenVideoModal}
                className="font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Film className="w-4 h-4 text-teal-500" /> 🎬 Google Flow (Veo 3.1)
              </Button>
            </div>
          </div>
        )}
      </div>

      {hasActiveContent && (
        <StudioPublishExportZone
          showVideoPublisherBtn={mediaType === "video" && Boolean(mediaUrl)}
          savingDraft={savingDraft}
          onOpenAutoPostModal={onOpenAutoPostModal}
          onSaveDraft={onSaveDraft}
          onSendToPublisher={onSendToPublisher}
        />
      )}
    </div>
  );
}
