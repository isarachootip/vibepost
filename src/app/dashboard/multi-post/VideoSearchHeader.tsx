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
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            English Video Prompt / คีย์เวิร์ดค้นหา
          </Label>
          {canReExtract && (
            <button
              type="button"
              disabled={extracting}
              onClick={onReExtract}
              className="text-[10px] font-bold text-primary hover:underline inline-flex items-center gap-1"
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
              className="pl-9 pr-4 h-11 rounded-xl text-xs font-medium"
            />
            {extracting ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin absolute left-3 top-3.5" />
            ) : (
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
            )}
          </div>
          <Button
            type="button"
            variant="neu"
            disabled={extracting || !prompt.trim()}
            onClick={() => onCategoryChange("custom")}
            className="font-bold h-11 px-4 rounded-xl text-xs"
          >
            กรองสต็อก
          </Button>
          <Button
            type="button"
            variant="tactile"
            disabled={generating || extracting || !prompt.trim()}
            onClick={onGenerateAI}
            className="font-bold h-11 px-4 rounded-xl text-xs flex items-center gap-1.5"
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

      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "neu-pressed text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
