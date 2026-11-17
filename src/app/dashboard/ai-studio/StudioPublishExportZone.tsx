"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookmarkPlus, Film, Loader2, Rocket, Settings2 } from "lucide-react";

interface StudioPublishExportZoneProps {
  showVideoPublisherBtn: boolean;
  savingDraft: boolean;
  onOpenAutoPostModal: () => void;
  onSaveDraft: () => void;
  onSendToPublisher: (mode: "single" | "video") => void;
}

export function StudioPublishExportZone({
  showVideoPublisherBtn,
  savingDraft,
  onOpenAutoPostModal,
  onSaveDraft,
  onSendToPublisher,
}: StudioPublishExportZoneProps) {
  return (
    <div className="pt-6 border-t border-border/60 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
          3. ส่งออกเพื่อเผยแพร่ (Publish &amp; Auto-Post)
        </Label>
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-500/12 px-2.5 py-0.5 rounded-md border border-emerald-500/25">
          ✨ พร้อมเผยแพร่
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <Button
          variant="tactile"
          onClick={onOpenAutoPostModal}
          className="sm:col-span-7 font-bold h-12 rounded-2xl flex items-center justify-center gap-2 text-xs"
        >
          <Rocket className="w-4 h-4 text-amber-300" />
          <span>🚀 เผยแพร่ทันที / ตั้งเวลา Auto-Post</span>
        </Button>

        <Button
          variant="neu"
          onClick={onSaveDraft}
          disabled={savingDraft}
          className="sm:col-span-5 text-primary font-bold h-12 rounded-2xl text-xs flex items-center justify-center gap-1.5"
        >
          {savingDraft ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
          ) : (
            <><BookmarkPlus className="w-4 h-4" /> 💾 บันทึกแบบร่าง</>
          )}
        </Button>
      </div>

      <div className="pt-1 flex flex-col sm:flex-row gap-2">
        <Button
          variant="neu"
          onClick={() => onSendToPublisher("single")}
          className="flex-1 font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-1.5"
        >
          <Settings2 className="w-3.5 h-3.5 text-muted-foreground" /> เปิดใน AI Publisher (ขั้นสูง)
        </Button>

        {showVideoPublisherBtn && (
          <Button
            variant="neu"
            onClick={() => onSendToPublisher("video")}
            className="flex-1 text-teal-600 dark:text-teal-400 font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5" /> โพสต์วิดีโอบรรยายคลิป
          </Button>
        )}
      </div>
    </div>
  );
}
