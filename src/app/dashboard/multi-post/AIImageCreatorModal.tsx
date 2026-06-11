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
import { generateAIImageAction } from "@/lib/actions/ai-generation";
import { Sparkles, Loader2, Image as ImageIcon, Check } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
};

const STYLES = [
  { id: "photo", label: "📸 Realistic Photo", desc: "ภาพถ่ายสมจริง แสงธรรมชาติ" },
  { id: "3d-render", label: "🤖 3D Render", desc: "ภาพสามมิติสไตล์การ์ตูน/โมเดิร์น" },
  { id: "vector", label: "🎨 Vector Art", desc: "ภาพเวกเตอร์สำหรับกราฟิกแบนแบรนด์" },
  { id: "digital-art", label: "🖌️ Digital Paint", desc: "ภาพวาดดิจิทัลลายเส้นสวยงาม" },
  { id: "anime", label: "🌸 Anime Style", desc: "ภาพวาดสไตล์อนิเมะญี่ปุ่น" },
];

const PROVIDERS = [
  { id: "FREE" as const, label: "✨ Free Stable Diffusion (ไม่ต้องใช้คีย์)", desc: "ภาพสวยงาม เจนรวดเร็ว ฟรี 100%" },
  { id: "GEMINI" as const, label: "♊ Gemini Imagen 3 (ใช้คีย์สเปซ)", desc: "ความละเอียดสูง ภาพสมจริง เหมาะกับธุรกิจ" },
  { id: "OPENAI" as const, label: "🧠 OpenAI DALL-E 3 (ใช้คีย์สเปซ)", desc: "เข้าใจคำสั่งละเอียด ตอบสนองได้ดีเยี่ยม" },
];

export function AIImageCreatorModal({ isOpen, onClose, onSelectImage }: Props) {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("photo");
  const [selectedProvider, setSelectedProvider] = useState<"FREE" | "GEMINI" | "OPENAI">("FREE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("กรุณากรอกคำอธิบายรูปภาพ (Prompt) ที่ต้องการสร้าง");
      return;
    }

    setLoading(true);
    setError("");
    setPreviewUrl(null);

    try {
      const res = await generateAIImageAction(prompt, selectedStyle, selectedProvider);
      if (res.success && res.asset) {
        setPreviewUrl(res.asset.fileUrl);
      } else {
        setError(res.error || "ไม่สามารถเจนภาพได้ เกิดข้อผิดพลาดทางเทคนิค");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  const handleUseImage = () => {
    if (previewUrl) {
      onSelectImage(previewUrl);
      onClose();
      // Reset state
      setPrompt("");
      setPreviewUrl(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white border border-slate-200 text-slate-800 shadow-2xl rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
            AI Image Creator
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            สร้างภาพประกอบโพสต์คุณภาพสูงด้วยคำบรรยายของคุณเอง
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
                  1. คำอธิบายรูปภาพ (Prompt)
                </Label>
                <Textarea
                  placeholder="เช่น ถ้วยกาแฟสกัดเย็น วางอยู่บนโต๊ะไม้ที่มีแสงแดดส่องผ่านหน้าต่าง สไตล์อบอุ่น..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 h-28 focus-visible:ring-purple-500 rounded-xl text-sm resize-none leading-relaxed"
                />
              </div>

              <div>
                <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                  2. เลือกสไตล์ภาพ (Style)
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3 text-left rounded-xl border text-sm transition-all duration-200 flex flex-col ${
                        selectedStyle === style.id
                          ? "border-purple-600 bg-purple-50/50 text-purple-900 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="font-bold">{style.label}</span>
                      <span className="text-xs text-slate-400 mt-0.5">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                  3. เลือกผู้ให้บริการ AI (AI engine)
                </Label>
                <div className="space-y-2">
                  {PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`w-full p-3 text-left rounded-xl border text-sm transition-all duration-200 flex flex-col ${
                        selectedProvider === provider.id
                          ? "border-purple-600 bg-purple-50/50 text-purple-900 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="font-bold">{provider.label}</span>
                      <span className="text-xs text-slate-400 mt-0.5">{provider.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Preview area */}
            <div className="flex flex-col justify-between border border-slate-100 rounded-2xl p-4 bg-slate-50 min-h-[300px]">
              <div>
                <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-3">
                  พรีวิวรูปภาพประกอบ
                </Label>

                {loading ? (
                  <div className="aspect-square w-full bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center shadow-inner">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                    <h4 className="font-bold text-slate-800">กำลังเจเนอเรตรูปภาพ...</h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      AI กำลังประมวลผลแสง สี และรายละเอียดภาพตามคำสั่งของคุณ ใช้เวลาประมาณ 5-10 วินาที
                    </p>
                  </div>
                ) : previewUrl ? (
                  <div className="aspect-square w-full rounded-xl overflow-hidden border border-slate-200 shadow-md relative group">
                    <img
                      src={previewUrl}
                      alt="AI Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full border-2 border-dashed border-slate-300 bg-white rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <ImageIcon className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-500 text-sm">ยังไม่ได้สร้างรูปภาพ</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      ป้อนคำสั่งด้านซ้ายแล้วกดสร้างเพื่อพรีวิวภาพที่นี่
                    </p>
                  </div>
                )}
              </div>

              {previewUrl ? (
                <Button
                  onClick={handleUseImage}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> นำรูปภาพนี้ไปใช้งาน
                </Button>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> กำลังสร้าง...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> เจเนอเรตรูปภาพ AI
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
