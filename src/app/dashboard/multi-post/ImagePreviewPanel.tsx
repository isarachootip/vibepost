"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { MediaGenerationMetadata } from "@/lib/validations/ai-media.schema";
import {
  AlertTriangle,
  Check,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface ImagePreviewPanelProps {
  loading: boolean;
  extracting: boolean;
  previewUrl: string | null;
  generationMeta: MediaGenerationMetadata | null;
  onGenerate: () => void;
  onUseImage: () => void;
}

export function ImagePreviewPanel({
  loading,
  extracting,
  previewUrl,
  generationMeta,
  onGenerate,
  onUseImage,
}: ImagePreviewPanelProps) {
  return (
    <div className="flex flex-col justify-between neu-pressed rounded-2xl p-4 min-h-[300px]">
      <div className="space-y-3">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
          พรีวิวรูปภาพประกอบ
        </Label>

        {loading ? (
          <div className="aspect-square w-full neu-raised rounded-xl flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
            <h4 className="font-display font-bold text-foreground text-sm">กำลังเจเนอเรตรูปภาพ...</h4>
            <p className="text-xs text-muted-foreground mt-1">ใช้เวลาประมาณ 5-10 วินาที</p>
          </div>
        ) : previewUrl ? (
          <div className="space-y-2.5">
            <div className="aspect-square w-full rounded-xl overflow-hidden border border-border/60 shadow-md bg-[var(--surface-recessed)]">
              <img src={previewUrl} alt="AI Preview" className="w-full h-full object-cover" />
            </div>
            {generationMeta?.usedFallback && (
              <div className="p-2.5 bg-amber-500/12 border border-amber-500/30 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    ใช้โมเดลสำรอง: {generationMeta.actualModel}
                  </span>
                  <span className="text-[10px] opacity-90">
                    {generationMeta.fallbackReason}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-square w-full border-2 border-dashed border-border/70 bg-[var(--surface-elevated)]/40 rounded-xl flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <ImageIcon className="w-10 h-10 opacity-40 mb-2" />
            <p className="font-semibold text-foreground/80 text-xs">ยังไม่ได้สร้างรูปภาพ</p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">
              ตรวจสอบ English Prompt ด้านซ้ายแล้วกดเจเนอเรตเพื่อดูตัวอย่าง
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2 mt-4">
        {previewUrl && (
          <Button
            type="button"
            variant="tactile"
            onClick={onUseImage}
            className="w-full font-bold h-11 rounded-xl flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> นำรูปภาพนี้ไปใช้งาน
          </Button>
        )}
        <Button
          type="button"
          variant={previewUrl ? "neu" : "tactile"}
          onClick={onGenerate}
          disabled={loading || extracting}
          className="w-full font-bold h-11 rounded-xl flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> กำลังสร้าง...
            </>
          ) : previewUrl ? (
            <>
              <RefreshCw className="w-4 h-4" /> เจนรูปใหม่ตาม Prompt
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> เจเนอเรตรูปภาพ AI
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
