"use client";

import React, { useTransition } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import {
  deletePostPermanently,
  restorePostFromTrash,
} from "@/lib/actions/posts";

type Props = {
  postId: string;
  isAdmin: boolean;
};

export function TrashActions({ postId, isAdmin }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = async () => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะกู้คืนโพสต์นี้กลับไปยังประวัติปกติ?")) {
      startTransition(async () => {
        const res = await restorePostFromTrash(postId);
        if (!res.success) {
          alert("เกิดข้อผิดพลาด: " + res.error);
        }
      });
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        "⚠️ คำเตือน: คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้ถาวร? การกระทำนี้ไม่สามารถย้อนกลับได้"
      )
    ) {
      startTransition(async () => {
        const res = await deletePostPermanently(postId);
        if (!res.success) {
          alert("เกิดข้อผิดพลาด: " + res.error);
        }
      });
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={handleRestore}
        disabled={isPending}
        className="neu-raised px-3 py-1.5 border border-[var(--border-control)] text-foreground hover:text-primary-ink font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
        title="กู้คืน"
      >
        <RotateCcw className="size-3" />
        กู้คืน
      </button>

      {isAdmin && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1.5 bg-destructive/15 hover:bg-destructive/25 border border-destructive/30 text-destructive font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
          title="ลบถาวร"
        >
          <Trash2 className="size-3" />
          ลบถาวร
        </button>
      )}
    </div>
  );
}
