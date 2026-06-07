"use client";

import React, { useTransition } from "react";
import { restorePostFromTrash, deletePostPermanently } from "@/lib/actions/posts";

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
    if (confirm("⚠️ คำเตือน: คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้ถาวร? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
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
        onClick={handleRestore}
        disabled={isPending}
        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
        title="กู้คืน"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M16 3h5v5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 21H3v-5" />
        </svg>
        กู้คืน
      </button>
      
      {isAdmin && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
          title="ลบถาวร"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          ลบถาวร
        </button>
      )}
    </div>
  );
}
