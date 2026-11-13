"use client";

import React, { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { movePostToTrash } from "@/lib/actions/posts";

export function HistoryRowActions({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleTrash = async () => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะย้ายโพสต์นี้ไปที่ถังขยะ?")) {
      startTransition(async () => {
        const res = await movePostToTrash(postId);
        if (!res.success) {
          alert("เกิดข้อผิดพลาด: " + res.error);
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleTrash}
      disabled={isPending}
      className="p-2 text-muted-foreground hover:text-destructive rounded-xl hover:bg-destructive/10 transition-colors disabled:opacity-50"
      title="ย้ายไปถังขยะ"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
