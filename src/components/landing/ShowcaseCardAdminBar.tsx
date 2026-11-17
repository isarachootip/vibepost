"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Pin, Trash2 } from "lucide-react";
import {
  togglePostPinAction,
  togglePostShowcaseAction,
} from "@/lib/actions/showcase.actions";
import { movePostToTrash } from "@/lib/actions/posts";

interface ShowcaseCardAdminBarProps {
  postId: string;
  showOnLanding: boolean;
  isPinnedOnLanding: boolean;
  workspaceShowOnLanding: boolean;
}

export function ShowcaseCardAdminBar({
  postId,
  showOnLanding,
  isPinnedOnLanding,
  workspaceShowOnLanding,
}: ShowcaseCardAdminBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleVisible = () => {
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
    if (!confirm("ต้องการย้ายโพสต์นี้ลงถังขยะหรือไม่? (กู้คืนได้ในหน้า Trash)")) return;
    startTransition(async () => {
      const res = await movePostToTrash(postId);
      if (!res.success) {
        alert(res.error || "ไม่สามารถย้ายลงถังขยะได้");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md p-1 border border-white/15 shadow-md">
      <button
        type="button"
        disabled={isPending}
        onClick={handleTogglePin}
        title={isPinnedOnLanding ? "ถอนหมุดจากบนสุด" : "ปักหมุดไว้บนสุด"}
        className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
          isPinnedOnLanding
            ? "bg-amber-500 text-black font-bold"
            : "text-white/85 hover:bg-white/20"
        }`}
      >
        <Pin className="size-3.5" />
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={handleToggleVisible}
        title={
          !workspaceShowOnLanding
            ? "แบรนด์นี้ถูกปิดโชว์ระดับ Workspace"
            : showOnLanding
            ? "ซ่อนจากหน้าแรก"
            : "แสดงบนหน้าแรก"
        }
        className={`px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
          showOnLanding && workspaceShowOnLanding
            ? "bg-emerald-500/85 text-white hover:bg-emerald-600"
            : "bg-zinc-600/90 text-white hover:bg-zinc-500"
        }`}
      >
        {isPending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : showOnLanding && workspaceShowOnLanding ? (
          <><Eye className="size-3" /> แสดงอยู่</>
        ) : (
          <><EyeOff className="size-3" /> ซ่อนอยู่</>
        )}
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={handleTrash}
        title="ย้ายลงถังขยะ"
        className="p-1.5 rounded-full text-rose-300 hover:bg-rose-500/80 hover:text-white transition-colors cursor-pointer"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
