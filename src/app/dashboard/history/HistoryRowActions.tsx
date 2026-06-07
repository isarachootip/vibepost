"use client";

import React, { useTransition } from "react";
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
      onClick={handleTrash}
      disabled={isPending}
      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
      title="ย้ายไปถังขยะ"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    </button>
  );
}
