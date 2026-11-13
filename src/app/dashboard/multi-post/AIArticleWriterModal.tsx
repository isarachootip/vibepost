"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateAIArticleAction } from "@/lib/actions/ai-generation";
import { PenTool, Loader2, Check, Sparkles, BookOpen } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUseArticle: (content: string) => void;
};

const TONES = [
  { id: "professional", label: "💼 Professional", desc: "เป็นทางการ น่าเชื่อถือ เหมาะสมกับองค์กร" },
  { id: "informative", label: "💡 Informative", desc: "ให้ความรู้ ข้อมูลเจาะลึก อธิบายรายละเอียด" },
  { id: "sales", label: "💰 Hard Sell", desc: "โฆษณาขายของ ดึงดูดความสนใจ ชวนซื้อสินค้า" },
  { id: "casual", label: "🥳 Casual & Friendly", desc: "เป็นกันเอง ตลก สนุกสนาน คล้ายเล่าให้เพื่อนฟัง" },
  { id: "storytelling", label: "📖 Storytelling", desc: "เล่าเรื่องเป็นละคร ลำดับเหตุการณ์ให้น่าติดตาม" },
];

const LENGTHS = [
  { id: "short", label: "สั้น (~200 คำ)" },
  { id: "medium", label: "ปานกลาง (~450 คำ)" },
  { id: "long", label: "ยาว (~800 คำ)" },
];

const LANGUAGES = [
  { id: "Thai", label: "🇹🇭 ภาษาไทย" },
  { id: "English", label: "🇬🇧 English" },
  { id: "Chinese (Simplified)", label: "🇨🇳 中文" },
  { id: "Japanese", label: "🇯🇵 日本語" },
];

export function AIArticleWriterModal({ isOpen, onClose, onUseArticle }: Props) {
  const [topic, setTopic] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [selectedLength, setSelectedLength] = useState("medium");
  const [selectedLanguage, setSelectedLanguage] = useState("Thai");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedArticle, setGeneratedArticle] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("กรุณากรอกหัวข้อหรือประเด็นหลักที่ต้องการเขียน");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedArticle(null);

    try {
      const res = await generateAIArticleAction(
        topic,
        selectedTone,
        selectedLength,
        selectedLanguage
      );
      if (res.success && res.article) {
        setGeneratedArticle(res.article);
      } else {
        setError(res.error || "เกิดข้อผิดพลาดในการเขียนบทความ กรุณาตรวจสอบคีย์เวิร์ดหรือ API Key");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedArticle) {
      onUseArticle(generatedArticle);
      onClose();
      // Reset state
      setTopic("");
      setGeneratedArticle(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <PenTool className="w-6 h-6 text-primary animate-pulse" />
            AI Article Writer
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            เขียนบทความขนาดยาวที่มีโครงสร้างน่าอ่านและมีเสน่ห์ด้วยขุมพลัง AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/12 border border-destructive/30 text-destructive rounded-xl text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: Inputs */}
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  1. หัวข้อ / ประเด็นหลัก
                </Label>
                <Textarea
                  placeholder="เช่น 5 เคล็ดลับการชงกาแฟ Cold Brew ดื่มเองที่บ้านอย่างไรให้อร่อยและประหยัด..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-24 rounded-xl text-sm resize-none leading-relaxed"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  2. เลือกโทนน้ำเสียง (Tone)
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {TONES.map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => setSelectedTone(tone.id)}
                      className={`p-3 text-left rounded-xl border text-xs transition-all duration-200 flex flex-col ${
                        selectedTone === tone.id
                          ? "neu-tint-primary"
                          : "border-border/60 bg-[var(--surface-recessed)]/65 hover:border-border text-foreground"
                      }`}
                    >
                      <span className="font-bold">{tone.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{tone.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    3. ความยาว (Length)
                  </Label>
                  <select
                    value={selectedLength}
                    onChange={(e) => setSelectedLength(e.target.value)}
                    className="w-full neu-pressed bg-[var(--surface-recessed)] border border-border/60 text-foreground rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold [&>option]:bg-[var(--surface-elevated)] [&>option]:text-foreground"
                  >
                    {LENGTHS.map((len) => (
                      <option key={len.id} value={len.id}>
                        {len.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    4. ภาษา (Language)
                  </Label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full neu-pressed bg-[var(--surface-recessed)] border border-border/60 text-foreground rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold [&>option]:bg-[var(--surface-elevated)] [&>option]:text-foreground"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right side: Preview area */}
            <div className="flex flex-col justify-between neu-pressed rounded-2xl p-4 min-h-[350px]">
              <div className="flex-1 flex flex-col">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                  พรีวิวเนื้อหาบทความ
                </Label>

                {loading ? (
                  <div className="flex-1 neu-raised rounded-xl flex flex-col items-center justify-center p-6 text-center min-h-[250px]">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <h4 className="font-display font-bold text-foreground">กำลังร่างบทความของคุณ...</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      ระบบ AI กำลังค้นคว้าข้อมูล วางโครงสร้างประโยค และแต่งบทความยาวตามโทนเสียงที่เลือก
                    </p>
                  </div>
                ) : generatedArticle ? (
                  <div className="flex-1 neu-raised rounded-xl p-4 overflow-y-auto max-h-[300px] text-foreground/90 text-sm whitespace-pre-wrap leading-relaxed">
                    {generatedArticle}
                  </div>
                ) : (
                  <div className="flex-1 border-2 border-dashed border-border/70 bg-[var(--surface-elevated)]/40 rounded-xl flex flex-col items-center justify-center p-6 text-center text-muted-foreground min-h-[250px]">
                    <BookOpen className="w-12 h-12 opacity-40 mb-3" />
                    <p className="font-semibold text-foreground/80 text-sm">ยังไม่มีการสร้างบทความ</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                      กำหนดหัวข้อทางด้านซ้ายและสั่งเจน เพื่อพรีวิวเนื้อหาตรงนี้
                    </p>
                  </div>
                )}
              </div>

              {generatedArticle ? (
                <Button
                  variant="tactile"
                  onClick={handleApply}
                  className="w-full mt-4 font-bold h-12 rounded-xl flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> นำบทความนี้ไปใส่ในโพสต์
                </Button>
              ) : (
                <Button
                  variant="tactile"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full mt-4 font-bold h-12 rounded-xl flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> กำลังแต่งบทความ...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> เจเนอเรตบทความ AI
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
