"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { generateAIImageAction } from "@/lib/actions/ai-generation";
import { extractVisualPromptAction } from "@/lib/actions/visual-prompt";
import type { AIImageProvider, MediaGenerationMetadata } from "@/lib/validations/ai-media.schema";
import { ImagePromptEditor, type PromptBuilderFields } from "./ImagePromptEditor";
import { ImagePreviewPanel } from "./ImagePreviewPanel";
import { Sparkles } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string, meta?: MediaGenerationMetadata) => void;
  initialPrompt?: string;
  sourceContent?: string;
};

const STYLES = [
  { id: "photo", label: "📸 Realistic Photo", desc: "ภาพถ่ายสมจริง แสงธรรมชาติ" },
  { id: "3d-render", label: "🤖 3D Render", desc: "ภาพสามมิติสไตล์โมเดิร์น" },
  { id: "vector", label: "🎨 Vector Art", desc: "ภาพเวกเตอร์สำหรับกราฟิกแบรนด์" },
  { id: "digital-art", label: "🖌️ Digital Paint", desc: "ภาพวาดดิจิทัลลายเส้นสวยงาม" },
  { id: "anime", label: "🌸 Anime Style", desc: "ภาพวาดสไตล์อนิเมะญี่ปุ่น" },
];

const PROVIDERS: Array<{ id: AIImageProvider; label: string; desc: string }> = [
  { id: "FREE", label: "✨ Free Stable Diffusion (ไม่ต้องใช้คีย์)", desc: "เจนรวดเร็ว ฟรี 100%" },
  { id: "GEMINI", label: "♊ Gemini Imagen 4 (ใช้คีย์สเปซ)", desc: "ความละเอียดสูง ภาพสมจริง" },
  { id: "OPENAI", label: "🧠 OpenAI DALL-E 3 (ใช้คีย์สเปซ)", desc: "เข้าใจคำสั่งละเอียดแม่นยำ" },
];

export function AIImageCreatorModal({ isOpen, onClose, onSelectImage, initialPrompt, sourceContent }: Props) {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("photo");
  const [selectedProvider, setSelectedProvider] = useState<AIImageProvider>("FREE");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractionBadge, setExtractionBadge] = useState<"llm" | "fallback" | null>(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generationMeta, setGenerationMeta] = useState<MediaGenerationMetadata | null>(null);
  const [promptMode, setPromptMode] = useState<"direct" | "builder">("direct");
  const [builder, setBuilder] = useState<PromptBuilderFields>({ subject: "", setting: "", style: "", camera: "" });

  const rawContext = sourceContent?.trim() || initialPrompt?.trim() || "";

  const runPromptExtraction = useCallback(async (textToExtract: string, styleId: string) => {
    if (!textToExtract.trim()) return;
    setExtracting(true);
    setError("");
    setPromptMode("direct");
    try {
      const res = await extractVisualPromptAction({ content: textToExtract, mediaType: "image", style: styleId });
      if (res.success) {
        setPrompt(res.englishPrompt);
        setExtractionBadge(res.usedFallbackTranslator ? "fallback" : "llm");
      } else {
        setPrompt(textToExtract.slice(0, 300));
        setExtractionBadge(null);
      }
    } catch {
      setPrompt(textToExtract.slice(0, 300));
      setExtractionBadge(null);
    } finally {
      setExtracting(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setPreviewUrl(null);
      setGenerationMeta(null);
      if (rawContext) void runPromptExtraction(rawContext, selectedStyle);
      else setExtractionBadge(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, rawContext]);

  useEffect(() => {
    if (promptMode === "builder") {
      setPrompt([builder.subject, builder.setting, builder.style, builder.camera].filter(Boolean).join(", "));
    }
  }, [promptMode, builder]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("กรุณากรอกคำอธิบายรูปภาพ (Prompt) ที่ต้องการสร้าง");
      return;
    }
    setLoading(true);
    setError("");
    setPreviewUrl(null);
    setGenerationMeta(null);
    try {
      const res = await generateAIImageAction(prompt, selectedStyle, selectedProvider);
      if (res.success && res.asset) {
        setPreviewUrl(res.asset.fileUrl);
        setGenerationMeta(res.meta ?? null);
        if (res.meta?.resolvedEnglishPrompt) setPrompt(res.meta.resolvedEnglishPrompt);
      } else {
        setError(res.error || "ไม่สามารถเจนภาพได้ เกิดข้อผิดพลาดทางเทคนิค");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  const handleUseImage = () => {
    if (!previewUrl) return;
    onSelectImage(previewUrl, generationMeta ?? undefined);
    onClose();
    setPreviewUrl(null);
    setGenerationMeta(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="mb-3">
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            AI Image Creator
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-xs">
            สกัด English Visual Prompt จากเนื้อหาอัตโนมัติ แก้ไขคำสั่งภาษาอังกฤษได้ก่อนกดสร้างภาพ
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3.5 bg-destructive/12 border border-destructive/30 text-destructive rounded-xl text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ImagePromptEditor
              prompt={prompt}
              onPromptChange={(val) => { setPrompt(val); setExtractionBadge(null); }}
              promptMode={promptMode}
              onPromptModeChange={setPromptMode}
              builder={builder}
              onBuilderChange={(patch) => setBuilder((prev) => ({ ...prev, ...patch }))}
              extracting={extracting}
              extractionBadge={extractionBadge}
              canReExtract={Boolean(rawContext)}
              onReExtract={() => void runPromptExtraction(rawContext, selectedStyle)}
            />

            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">2. เลือกสไตล์ภาพ (Style)</Label>
              <div className="grid grid-cols-1 gap-1.5">
                {STYLES.map((item) => (
                  <button key={item.id} type="button" onClick={() => setSelectedStyle(item.id)}
                    className={`p-2 text-left rounded-xl border text-xs transition-all flex flex-col ${
                      selectedStyle === item.id ? "neu-tint-primary" : "border-border/60 bg-[var(--surface-recessed)]/65 hover:border-border text-foreground"
                    }`}>
                    <span className="font-bold">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">3. ผู้ให้บริการ AI (AI Engine)</Label>
              <div className="space-y-1.5">
                {PROVIDERS.map((prov) => (
                  <button key={prov.id} type="button" onClick={() => setSelectedProvider(prov.id)}
                    className={`w-full p-2 text-left rounded-xl border text-xs transition-all flex flex-col ${
                      selectedProvider === prov.id ? "neu-tint-primary" : "border-border/60 bg-[var(--surface-recessed)]/65 hover:border-border text-foreground"
                    }`}>
                    <span className="font-bold">{prov.label}</span>
                    <span className="text-[10px] text-muted-foreground">{prov.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ImagePreviewPanel loading={loading} extracting={extracting} previewUrl={previewUrl} generationMeta={generationMeta} onGenerate={handleGenerate} onUseImage={handleUseImage} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
