"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, Search, Sparkles } from "lucide-react";

const CATEGORIES = [
  { id: "trending", label: "🔥 ยอดฮิต" },
  { id: "business", label: "💼 ธุรกิจ/ออฟฟิศ" },
  { id: "coffee", label: "☕ คาเฟ่/ลาเต้" },
  { id: "cooking", label: "🍳 อาหาร/ห้องครัว" },
  { id: "technology", label: "💻 เทคโนโลยี/โค้ด" },
  { id: "fitness", label: "💪 สุขภาพ/ฟิตเนส" },
  { id: "travel", label: "✈️ ท่องเที่ยว/ทะเล" },
];

interface VideoSearchHeaderProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  extracting: boolean;
  generating: boolean;
  isGeneratingCustom: boolean;
  canReExtract: boolean;
  onReExtract: () => void;
  onGenerateAI: () => void;
}

export function VideoSearchHeader({
  prompt,
  onPromptChange,
  selectedCategory,
  onCategoryChange,
  extracting,
  generating,
  isGeneratingCustom,
  canReExtract,
  onReExtract,
  onGenerateAI,
}: VideoSearchHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-black text-slate-600 uppercase tracking-wider">
            English Video Prompt / คีย์เวิร์ดค้นหา
          </Label>
          {canReExtract && (
            <button
              type="button"
              disabled={extracting}
              onClick={onReExtract}
              className="text-[10px] font-bold text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${extracting ? "animate-spin" : ""}`} />
              สกัดใหม่จากเนื้อหา
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              disabled={extracting}
              placeholder={
                extracting
                  ? "กำลังสกัด English Prompt จากบทความ..."
                  : "e.g. Scenic river estuary pagoda in Thailand, drone shot..."
              }
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && prompt.trim() && onCategoryChange("custom")}
              className="bg-slate-50 border-slate-200 text-slate-800 pl-9 pr-4 h-11 rounded-xl text-xs font-medium"
            />
            {extracting ? (
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin absolute left-3 top-3.5" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={extracting || !prompt.trim()}
            onClick={() => onCategoryChange("custom")}
            className="border-slate-200 text-slate-700 font-bold h-11 px-4 rounded-xl text-xs"
          >
            กรองสต็อก
          </Button>
          <Button
            type="button"
            disabled={generating || extracting || !prompt.trim()}
            onClick={onGenerateAI}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-11 px-4 rounded-xl text-xs flex items-center gap-1.5"
          >
            {isGeneratingCustom ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            เจนวิดีโอ AI จาก Prompt
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
