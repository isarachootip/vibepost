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
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
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
      <DialogContent className="sm:max-w-3xl bg-white border border-slate-200 text-slate-800 shadow-2xl rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <PenTool className="w-6 h-6 text-purple-600 animate-pulse" />
            AI Article Writer
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            เขียนบทความขนาดยาวที่มีโครงสร้างน่าอ่านและมีเสน่ห์ด้วยขุมพลัง AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: Inputs */}
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                  1. หัวข้อ / ประเด็นหลัก
                </Label>
                <Textarea
                  placeholder="เช่น 5 เคล็ดลับการชงกาแฟ Cold Brew ดื่มเองที่บ้านอย่างไรให้อร่อยและประหยัด..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 h-24 focus-visible:ring-purple-500 rounded-xl text-sm resize-none leading-relaxed"
                />
              </div>

              <div>
                <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                  2. เลือกโทนน้ำเสียง (Tone)
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id)}
                      className={`p-3 text-left rounded-xl border text-xs transition-all duration-200 flex flex-col ${
                        selectedTone === tone.id
                          ? "border-purple-600 bg-purple-50/50 text-purple-900 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="font-bold">{tone.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{tone.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                    3. ความยาว (Length)
                  </Label>
                  <select
                    value={selectedLength}
                    onChange={(e) => setSelectedLength(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  >
                    {LENGTHS.map((len) => (
                      <option key={len.id} value={len.id}>
                        {len.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                    4. ภาษา (Language)
                  </Label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
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
            <div className="flex flex-col justify-between border border-slate-100 rounded-2xl p-4 bg-slate-50 min-h-[350px]">
              <div className="flex-1 flex flex-col">
                <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-3">
                  พรีวิวเนื้อหาบทความ
                </Label>

                {loading ? (
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center shadow-inner min-h-[250px]">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                    <h4 className="font-bold text-slate-800">กำลังร่างบทความของคุณ...</h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      ระบบ AI กำลังค้นคว้าข้อมูล วางโครงสร้างประโยค และแต่งบทความยาวตามโทนเสียงที่เลือก
                    </p>
                  </div>
                ) : generatedArticle ? (
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-inner overflow-y-auto max-h-[300px] text-slate-700 text-sm whitespace-pre-wrap leading-relaxed font-serif">
                    {generatedArticle}
                  </div>
                ) : (
                  <div className="flex-1 border-2 border-dashed border-slate-300 bg-white rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400 min-h-[250px]">
                    <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-500 text-sm">ยังไม่มีการสร้างบทความ</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      กำหนดหัวข้อทางด้านซ้ายและสั่งเจน เพื่อพรีวิวเนื้อหาตรงนี้
                    </p>
                  </div>
                )}
              </div>

              {generatedArticle ? (
                <Button
                  onClick={handleApply}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> นำบทความนี้ไปใส่ในโพสต์
                </Button>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
