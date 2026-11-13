"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { DraftPostItem } from "@/lib/actions/posts";
import { FileEdit, Film, Image as ImageIcon, Rocket, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface DraftCardProps {
  draft: DraftPostItem;
  isDeleting: boolean;
  onDelete: (id: string) => void;
  onEdit: (draft: DraftPostItem) => void;
  onConfigure: (draft: DraftPostItem) => void;
}

export function DraftCard({
  draft,
  isDeleting,
  onDelete,
  onEdit,
  onConfigure,
}: DraftCardProps) {
  const firstMedia = draft.media?.[0];

  return (
    <div className="neu-raised neu-grain rounded-3xl overflow-hidden transition-all hover:-translate-y-0.5 flex flex-col justify-between group">
      <div>
        {firstMedia ? (
          <div className="relative aspect-video w-full bg-[var(--surface-recessed)] overflow-hidden border-b border-border/60">
            {firstMedia.fileType === "VIDEO" ? (
              <video
                src={firstMedia.url}
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                muted
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={firstMedia.url}
                alt="Draft visual"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              {firstMedia.fileType === "VIDEO" ? (
                <Film className="w-3 h-3 text-teal-300" />
              ) : (
                <ImageIcon className="w-3 h-3 text-violet-300" />
              )}
              <span>{firstMedia.fileType === "VIDEO" ? "วิดีโอ" : "รูปภาพ"}</span>
            </div>

            <div className="absolute bottom-2 right-2 text-[10px] text-white/90 bg-black/55 backdrop-blur-xs px-2 py-0.5 rounded-md font-medium">
              {format(new Date(draft.createdAt), "d MMM yyyy, HH:mm", { locale: th })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[var(--surface-recessed)]/70 border-b border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-bold text-foreground/80">📝 ข้อความแคปชัน (ไม่มีสื่อ)</span>
            <span className="text-[10px]">
              {format(new Date(draft.createdAt), "d MMM yyyy", { locale: th })}
            </span>
          </div>
        )}

        <div className="p-5 space-y-3">
          <p className="text-xs text-foreground/85 leading-relaxed line-clamp-4 whitespace-pre-wrap">
            {draft.content}
          </p>
          <div className="text-[10px] text-muted-foreground font-mono">
            {draft.content.length} ตัวอักษร
          </div>
        </div>
      </div>

      <div className="p-4 bg-[var(--surface-recessed)]/65 border-t border-border/60 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={() => onDelete(draft.id)}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs h-9 px-2.5 rounded-xl transition-colors"
          title="ลบแบบร่าง"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="neu"
            size="sm"
            onClick={() => onEdit(draft)}
            className="text-xs h-9 px-3 rounded-xl font-bold"
          >
            <FileEdit className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> แก้ไข
          </Button>

          <Button
            variant="tactile"
            size="sm"
            onClick={() => onConfigure(draft)}
            className="font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5"
          >
            <Rocket className="w-3.5 h-3.5 text-amber-300" /> ตั้งค่า & สั่งโพสต์
          </Button>
        </div>
      </div>
    </div>
  );
}
