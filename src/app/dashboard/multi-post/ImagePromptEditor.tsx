"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";

export interface PromptBuilderFields {
  subject: string;
  setting: string;
  style: string;
  camera: string;
}

interface ImagePromptEditorProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  promptMode: "direct" | "builder";
  onPromptModeChange: (mode: "direct" | "builder") => void;
  builder: PromptBuilderFields;
  onBuilderChange: (patch: Partial<PromptBuilderFields>) => void;
  extracting: boolean;
  extractionBadge: "llm" | "fallback" | null;
  canReExtract: boolean;
  onReExtract: () => void;
}

export function ImagePromptEditor({
  prompt,
  onPromptChange,
  promptMode,
  onPromptModeChange,
  builder,
  onBuilderChange,
  extracting,
  extractionBadge,
  canReExtract,
  onReExtract,
}: ImagePromptEditorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2">
        <Label className="text-xs font-black text-slate-600 uppercase tracking-wider">
          1. คำสั่งภาพ (English Visual Prompt)
        </Label>
        {canReExtract && (
          <button
            type="button"
            disabled={extracting}
            onClick={onReExtract}
            className="text-[10px] font-bold text-purple-600 hover:text-purple-800 inline-flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${extracting ? "animate-spin" : ""}`} />
            สกัดใหม่จากเนื้อหา
          </button>
        )}
      </div>

      {/* Mode Selector Toggle */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-2.5 border border-slate-200/50">
        <button
          type="button"
          onClick={() => onPromptModeChange("direct")}
          className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
            promptMode === "direct"
              ? "bg-white text-purple-900 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ✍️ คีย์คำสั่งหลัก (Direct)
        </button>
        <button
          type="button"
          onClick={() => onPromptModeChange("builder")}
          className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
            promptMode === "builder"
              ? "bg-white text-purple-900 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          🤖 สร้างคำสั่งแยกส่วน (Builder)
        </button>
      </div>

      {extracting ? (
        <div className="h-44 rounded-xl border border-purple-200 bg-purple-50/50 p-4 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-6 h-6 text-purple-600 animate-spin mb-2" />
          <p className="text-xs font-bold text-purple-900">
            กำลังอ่านบทความและสกัด English Visual Prompt...
          </p>
          <p className="text-[10px] text-purple-600 mt-1">
            ระบบกำลังดึงจุดเด่น สถานที่ และบรรยากาศให้ตรงกับเนื้อหา
          </p>
        </div>
      ) : promptMode === "direct" ? (
        <div className="space-y-1.5">
          <Textarea
            placeholder="e.g. Scenic travel photography of Phra Samut Chedi white riverside pagoda in Samut Prakan, Thailand, warm golden hour..."
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 h-40 focus-visible:ring-purple-500 rounded-xl text-xs resize-none leading-relaxed"
          />
          {extractionBadge && (
            <div className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
              <span>
                {extractionBadge === "llm"
                  ? "สกัด English Visual Prompt จากเนื้อหาบทความแล้ว (แก้ไขเพิ่มเติมได้)"
                  : "แปลเนื้อหาเป็นภาษาอังกฤษอัตโนมัติ (โหมดแปลสำรอง แก้ไขเพิ่มเติมได้)"}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 p-3 border border-slate-200 bg-slate-50 rounded-xl">
          {[
            { key: "subject" as const, label: "วัตถุหลัก (Subject)", ph: "e.g. Phra Samut Chedi riverside pagoda" },
            { key: "setting" as const, label: "ฉากหลัง/สถานที่ (Setting)", ph: "e.g. Chao Phraya River estuary in Thailand" },
            { key: "style" as const, label: "สไตล์และแสง (Style & Light)", ph: "e.g. Golden hour sunlight, realistic travel photo" },
            { key: "camera" as const, label: "มุมกล้อง (Camera/Lens)", ph: "e.g. Wide angle aerial shot, 35mm" },
          ].map((field) => (
            <div key={field.key} className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {field.label}
              </span>
              <Input
                placeholder={field.ph}
                value={builder[field.key]}
                onChange={(e) => onBuilderChange({ [field.key]: e.target.value })}
                className="bg-white border-slate-200 text-slate-800 text-xs rounded-xl focus-visible:ring-purple-500 h-8"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
