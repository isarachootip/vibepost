"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  VeoAspectRatio,
  VeoDurationSeconds,
  VeoModelTier,
} from "@/lib/validations/veo-video.schema";
import type { QuotaCheckResult } from "@/lib/services/veo-quota.service";
import { VeoSourceImageInput } from "./VeoSourceImageInput";
import {
  Film,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Volume2,
} from "lucide-react";

interface VeoFlowGeneratorPanelProps {
  prompt: string;
  onPromptChange: (v: string) => void;
  sourceImageUrl: string | null;
  onSourceImageChange: (url: string | null) => void;
  extracting: boolean;
  submitting: boolean;
  canReExtract: boolean;
  hasGeminiKey: boolean;
  quota: QuotaCheckResult | null;
  onReExtract: () => void;
  onSubmitJob: (opts: {
    modelTier: VeoModelTier;
    aspectRatio: VeoAspectRatio;
    durationSeconds: VeoDurationSeconds;
  }) => void;
}

export function VeoFlowGeneratorPanel({
  prompt,
  onPromptChange,
  sourceImageUrl,
  onSourceImageChange,
  extracting,
  submitting,
  canReExtract,
  hasGeminiKey,
  quota,
  onReExtract,
  onSubmitJob,
}: VeoFlowGeneratorPanelProps) {
  const [mode, setMode] = useState<"text" | "image">(sourceImageUrl ? "image" : "text");
  const [modelTier, setModelTier] = useState<VeoModelTier>("FAST");
  const [aspectRatio, setAspectRatio] = useState<VeoAspectRatio>("9:16");
  const [durationSeconds, setDurationSeconds] = useState<VeoDurationSeconds>(6);

  const quotaBlocked = quota ? !quota.allowed : false;

  return (
    <div className="neu-pressed rounded-2xl p-4 sm:p-5 space-y-4 border border-border/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex p-1 rounded-xl bg-[var(--surface-recessed)] border border-border/60 gap-1">
          <button
            type="button"
            onClick={() => { setMode("text"); onSourceImageChange(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === "text" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Text-to-Video
          </button>
          <button
            type="button"
            onClick={() => setMode("image")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === "image" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Image-to-Video
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-teal-500/12 text-teal-600 dark:text-teal-300 border border-teal-500/25 flex items-center gap-1">
            <Volume2 className="w-3 h-3" /> Native Audio
          </span>
          {quota && (
            <span className={`px-2.5 py-1 rounded-lg border ${
              quota.allowed ? "bg-primary/12 text-primary border-primary/25" : "bg-destructive/12 text-destructive border-destructive/30"
            }`}>
              โควตาวันนี้: {quota.used}/{quota.limit} คลิป
            </span>
          )}
        </div>
      </div>

      {!hasGeminiKey && (
        <div className="p-3 bg-amber-500/12 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-300 font-semibold">
          ⚠️ ยังไม่ได้ตั้งค่า Google Gemini API Key — ไปผูกคีย์ที่หน้า{" "}
          <a href="/dashboard/settings" className="underline font-extrabold">Settings</a>{" "}
          เพื่อเปิดใช้งาน Google Flow (Veo 3.1)
        </div>
      )}

      {mode === "image" && (
        <VeoSourceImageInput
          sourceImageUrl={sourceImageUrl}
          onSourceImageChange={onSourceImageChange}
        />
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            คำบรรยายฉากและการเคลื่อนไหวกล้อง (ไทย หรือ อังกฤษ)
          </Label>
          {canReExtract && (
            <button
              type="button"
              disabled={extracting}
              onClick={onReExtract}
              className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${extracting ? "animate-spin" : ""}`} />
              สกัดจากบทความใหม่
            </button>
          )}
        </div>
        <Textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={extracting}
          placeholder="เช่น กล้องซูมช้าๆ เข้าหาจานผัดไทยกุ้งสดควันฉุย แสงไฟอบอุ่น มีเสียงกระทะเบาๆ..."
          className="h-20 rounded-xl text-xs leading-relaxed resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-[11px] font-bold text-muted-foreground block mb-1">โมเดล Google Flow</Label>
          <select
            value={modelTier}
            onChange={(e) => setModelTier(e.target.value as VeoModelTier)}
            className="w-full h-10 px-3 rounded-xl text-xs font-bold bg-[var(--surface-elevated)] border border-border/70 text-foreground"
          >
            <option value="FAST">⚡ Veo 3.1 Fast (เร็ว &amp; ประหยัด)</option>
            <option value="STANDARD">🎬 Veo 3.1 Standard (Cinematic)</option>
          </select>
        </div>

        <div>
          <Label className="text-[11px] font-bold text-muted-foreground block mb-1">สัดส่วนวิดีโอ</Label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as VeoAspectRatio)}
            className="w-full h-10 px-3 rounded-xl text-xs font-bold bg-[var(--surface-elevated)] border border-border/70 text-foreground"
          >
            <option value="9:16">📱 9:16 (Reels / TikTok / Shorts)</option>
            <option value="16:9">🖥️ 16:9 (YouTube / Facebook)</option>
          </select>
        </div>

        <div>
          <Label className="text-[11px] font-bold text-muted-foreground block mb-1">ความยาวคลิป</Label>
          <select
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(Number(e.target.value) as VeoDurationSeconds)}
            className="w-full h-10 px-3 rounded-xl text-xs font-bold bg-[var(--surface-elevated)] border border-border/70 text-foreground"
          >
            <option value={4}>4 วินาที</option>
            <option value={6}>6 วินาที (แนะนำ)</option>
            <option value={8}>8 วินาที</option>
          </select>
        </div>
      </div>

      <Button
        type="button"
        variant="tactile"
        disabled={submitting || extracting || !hasGeminiKey || quotaBlocked || !prompt.trim() || (mode === "image" && !sourceImageUrl)}
        onClick={() => onSubmitJob({ modelTier, aspectRatio, durationSeconds })}
        className="w-full h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
      >
        {submitting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> กำลังส่งคำขอไปยัง Google Veo 3.1...</>
        ) : (
          <><Film className="w-4 h-4" /> 🚀 เริ่มสร้างวิดีโอ Google Flow (ทำงานเบื้องหลัง ปิดหน้าต่างได้)</>
        )}
      </Button>
    </div>
  );
}
