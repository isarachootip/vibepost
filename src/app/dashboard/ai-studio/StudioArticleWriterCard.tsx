"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Loader2, PenTool, Sparkles } from "lucide-react";

export type ArticleFormatKey = "longForm" | "socialPost" | "marketingAida";

const TONES = [
  { id: "professional", label: "💼 Professional" },
  { id: "informative", label: "💡 Informative" },
  { id: "sales", label: "💰 Hard Sell" },
  { id: "casual", label: "🥳 Casual" },
  { id: "storytelling", label: "📖 Storytelling" },
];

const LENGTHS = [
  { id: "short", label: "สั้น (~200 คำ)" },
  { id: "medium", label: "ปานกลาง (~450 คำ)" },
  { id: "long", label: "ยาว (~800 คำ)" },
];

const LANGUAGES = [
  { id: "Thai", label: "🇹🇭 ภาษาไทย" },
  { id: "English", label: "🇬🇧 English" },
  { id: "Japanese", label: "🇯🇵 日本語" },
  { id: "Chinese (Simplified)", label: "🇨🇳 中文" },
];

const FORMAT_OPTIONS: Array<{ id: ArticleFormatKey; label: string; desc: string }> = [
  { id: "longForm", label: "📄 บทความยาว", desc: "Long-form" },
  { id: "socialPost", label: "📱 แคปชันโซเชียล", desc: "Short Caption" },
  { id: "marketingAida", label: "🎯 โฆษณา AIDA", desc: "Marketing copy" },
];

interface StudioArticleWriterCardProps {
  topic: string;
  onTopicChange: (val: string) => void;
  selectedTone: string;
  onToneChange: (val: string) => void;
  selectedLength: string;
  onLengthChange: (val: string) => void;
  selectedLanguage: string;
  onLanguageChange: (val: string) => void;
  loadingArticle: boolean;
  formats: Record<ArticleFormatKey, string>;
  selectedFormat: ArticleFormatKey;
  onSelectFormat: (fmt: ArticleFormatKey) => void;
  onEditorChange: (val: string) => void;
  onGenerateArticle: () => void;
}

export function StudioArticleWriterCard({
  topic,
  onTopicChange,
  selectedTone,
  onToneChange,
  selectedLength,
  onLengthChange,
  selectedLanguage,
  onLanguageChange,
  loadingArticle,
  formats,
  selectedFormat,
  onSelectFormat,
  onEditorChange,
  onGenerateArticle,
}: StudioArticleWriterCardProps) {
  return (
    <div className="lg:col-span-7 neu-raised neu-grain rounded-3xl p-6 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
          <PenTool className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-foreground text-lg">
            1. เขียนบทความและข้อความโพสต์
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              หัวข้อหรือคำอธิบายเนื้อหาที่ต้องการ
            </Label>
            <Textarea
              placeholder="เช่น แนะนำผลิตภัณฑ์อาหารเสริมคอลลาเจนตัวใหม่ ช่วยเรื่องผิวพรรณสดใสภายใน 14 วัน..."
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              className="h-24 rounded-xl text-sm resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">น้ำเสียง (Tone)</Label>
              <select
                value={selectedTone}
                onChange={(e) => onToneChange(e.target.value)}
                className="w-full neu-pressed bg-[var(--surface-recessed)] border border-border/60 text-foreground rounded-xl p-3 text-xs font-bold"
              >
                {TONES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">ความยาวบทความ</Label>
              <select
                value={selectedLength}
                onChange={(e) => onLengthChange(e.target.value)}
                className="w-full neu-pressed bg-[var(--surface-recessed)] border border-border/60 text-foreground rounded-xl p-3 text-xs font-bold"
              >
                {LENGTHS.map((len) => (
                  <option key={len.id} value={len.id}>{len.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">ภาษา</Label>
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="w-full neu-pressed bg-[var(--surface-recessed)] border border-border/60 text-foreground rounded-xl p-3 text-xs font-bold"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            variant="tactile"
            onClick={onGenerateArticle}
            disabled={loadingArticle || !topic.trim()}
            className="w-full font-bold h-12 rounded-xl flex items-center justify-center gap-2"
          >
            {loadingArticle ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> กำลังเขียนบทความด้วย AI...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> เจเนอเรตเนื้อหา 3 รูปแบบพร้อมกัน</>
            )}
          </Button>
        </div>

        <div className="space-y-3 pt-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            ผลลัพธ์บทความ (เลือกรูปแบบที่ต้องการและพิมพ์แก้ไขได้โดยตรง)
          </Label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {FORMAT_OPTIONS.map((fmt) => {
              const hasContent = Boolean(formats[fmt.id]);
              const isSelected = selectedFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => onSelectFormat(fmt.id)}
                  className={`p-3 text-left rounded-xl border text-xs transition-all flex flex-col ${
                    isSelected ? "neu-tint-primary" : "neu-pressed border-border/60 text-muted-foreground hover:text-foreground"
                  } ${!hasContent ? "opacity-65" : ""}`}
                >
                  <span className="font-bold">{fmt.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">{fmt.desc}</span>
                </button>
              );
            })}
          </div>

          {loadingArticle ? (
            <div className="neu-pressed rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <h4 className="font-display font-bold text-foreground">กำลังแต่งบทความ 3 สไตล์...</h4>
            </div>
          ) : formats[selectedFormat] ? (
            <div className="space-y-1">
              <Textarea
                value={formats[selectedFormat]}
                onChange={(e) => onEditorChange(e.target.value)}
                className="h-[320px] rounded-2xl text-sm leading-relaxed p-4 resize-none"
              />
              <div className="text-[10px] text-muted-foreground text-right font-mono">
                ความยาวของรูปแบบที่เลือก: {formats[selectedFormat].length} ตัวอักษร
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border/70 neu-pressed rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center text-muted-foreground">
              <BookOpen className="w-10 h-10 opacity-40 mb-2" />
              <p className="font-semibold text-foreground/80 text-xs">ยังไม่มีการสร้างบทความ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
