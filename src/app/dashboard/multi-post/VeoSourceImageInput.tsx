"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";

interface VeoSourceImageInputProps {
  sourceImageUrl: string | null;
  onSourceImageChange: (url: string | null) => void;
}

export function VeoSourceImageInput({
  sourceImageUrl,
  onSourceImageChange,
}: VeoSourceImageInputProps) {
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    setUploadErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "อัปโหลดรูปไม่สำเร็จ");
      onSourceImageChange(data.url);
    } catch (err: unknown) {
      setUploadErr(err instanceof Error ? err.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploadingImg(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        ภาพต้นทางสำหรับสร้างการเคลื่อนไหว (Source Frame)
      </Label>
      {sourceImageUrl ? (
        <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-border/60 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sourceImageUrl} alt="Source frame" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onSourceImageChange(null)}
            className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground p-1 rounded-full"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label className="border-2 border-dashed border-border/70 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer hover:border-primary/50 text-xs font-bold text-muted-foreground">
          <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} disabled={uploadingImg} />
          {uploadingImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-primary" />}
          <span>{uploadingImg ? "กำลังอัปโหลดภาพ..." : "คลิกอัปโหลดภาพสินค้า/ฉากต้นทาง (JPG, PNG, WebP)"}</span>
        </label>
      )}
      {uploadErr && <p className="text-xs text-destructive font-semibold">⚠️ {uploadErr}</p>}
    </div>
  );
}
