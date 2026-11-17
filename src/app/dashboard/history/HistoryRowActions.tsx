"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Pin, Trash2 } from "lucide-react";
import { movePostToTrash } from "@/lib/actions/posts";
import {
  togglePostPinAction,
  togglePostShowcaseAction,
} from "@/lib/actions/showcase.actions";

interface HistoryRowActionsProps {
  postId: string;
  showOnLanding?: boolean;
  isPinnedOnLanding?: boolean;
  workspaceShowOnLanding?: boolean;
  canManageShowcase?: boolean;
  isSuperAdmin?: boolean;
}

export function HistoryRowActions({
  postId,
  showOnLanding = true,
  isPinnedOnLanding = false,
  workspaceShowOnLanding = true,
  canManageShowcase = false,
  isSuperAdmin = false,
}: HistoryRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleShowcase = () => {
    startTransition(async () => {
      const res = await togglePostShowcaseAction({
        postId,
        showOnLanding: !showOnLanding,
      });
      if (!res.success) {
        alert(res.error || "ไม่สามารถเปลี่ยนสถานะการแสดงผลได้");
        return;
      }
      router.refresh();
    });
  };

  const handleTogglePin = () => {
    startTransition(async () => {
      const res = await togglePostPinAction({
        postId,
        isPinnedOnLanding: !isPinnedOnLanding,
      });
      if (!res.success) {
        alert(res.error || "ไม่สามารถปักหมุดได้");
        return;
      }
      router.refresh();
    });
  };

  const handleTrash = () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะย้ายโพสต์นี้ไปที่ถังขยะ?")) return;
    startTransition(async () => {
      const res = await movePostToTrash(postId);
      if (!res.success) {
        alert("เกิดข้อผิดพลาด: " + res.error);
        return;
      }
      router.refresh();
    });
  };

  const effectivelyVisible = workspaceShowOnLanding && showOnLanding;

  return (
    <div className="inline-flex items-center justify-end gap-1.5">
      {isSuperAdmin && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleTogglePin}
          title={isPinnedOnLanding ? "ถอนหมุดจากบนสุดของหน้าแรก" : "ปักหมุดไว้บนสุดของหน้าแรก"}
          className={`p-2 rounded-xl border transition-colors cursor-pointer disabled:opacity-50 ${
            isPinnedOnLanding
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/35"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-[var(--surface-recessed)]"
          }`}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
      )}

      {canManageShowcase && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleToggleShowcase}
          title={
            !workspaceShowOnLanding
              ? "แบรนด์นี้ถูกปิดการแสดงผลบนหน้าแรกในหน้า Settings"
              : showOnLanding
              ? "คลิกเพื่อซ่อนจากหน้าแรกสาธารณะ"
              : "คลิกเพื่อแสดงบนหน้าแรกสาธารณะ"
          }
          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 ${
            effectivelyVisible
              ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20"
              : "bg-[var(--surface-recessed)] text-muted-foreground border-border/60 hover:text-foreground"
          }`}
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : effectivelyVisible ? (
            <><Eye className="w-3.5 h-3.5" /> โชว์หน้าแรก</>
          ) : (
            <><EyeOff className="w-3.5 h-3.5" /> ซ่อนหน้าแรก</>
          )}
        </button>
      )}

      <button
        type="button"
        onClick={handleTrash}
        disabled={isPending}
        className="p-2 text-muted-foreground hover:text-destructive rounded-xl hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50"
        title="ย้ายไปถังขยะ"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
