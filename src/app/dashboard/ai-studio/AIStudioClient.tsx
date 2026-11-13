"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  generateAIArticleAction,
  getAIUsageStatsAction,
} from "@/lib/actions/ai-generation";
import { createDraftPost } from "@/lib/actions/posts";
import { AIImageCreatorModal } from "../multi-post/AIImageCreatorModal";
import { AIVideoStudioModal } from "../multi-post/AIVideoStudioModal";
import { StudioAutoPostModal } from "./StudioAutoPostModal";
import type { MediaGenerationMetadata } from "@/lib/validations/ai-media.schema";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sparkles,
  PenTool,
  Film,
  Image as ImageIcon,
  Loader2,
  Check,
  BookOpen,
  X,
  Rocket,
  Settings2,
  BookmarkPlus,
  Layers,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const TONES = [
  { id: "professional", label: "💼 Professional", desc: "เป็นทางการ น่าเชื่อถือ" },
  { id: "informative", label: "💡 Informative", desc: "ให้ความรู้ ข้อมูลเจาะลึก" },
  { id: "sales", label: "💰 Hard Sell", desc: "เน้นขายของ ชวนซื้อสินค้า" },
  { id: "casual", label: "🥳 Casual", desc: "เป็นกันเอง สนุกสนานสบายๆ" },
  { id: "storytelling", label: "📖 Storytelling", desc: "เล่าเรื่องเป็นฉากๆ ลำดับเรื่องน่าอ่าน" },
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

type Connection = {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
};

type ArticleFormatKey = "longForm" | "socialPost" | "marketingAida";

interface AIUsageStats {
  totalCost: number;
  totalTokens: number;
  totalCalls: number;
  articleCalls: number;
  imageCalls: number;
  videoCalls: number;
}

const FORMAT_OPTIONS: Array<{ id: ArticleFormatKey; label: string; desc: string }> = [
  { id: "longForm", label: "📄 บทความยาว", desc: "Long-form" },
  { id: "socialPost", label: "📱 แคปชันโซเชียล", desc: "Short Caption" },
  { id: "marketingAida", label: "🎯 โฆษณา AIDA", desc: "Marketing copy" },
];

export function AIStudioClient({ connections = [] }: { connections?: Connection[] }) {
  const router = useRouter();
  
  // Article State
  const [topic, setTopic] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [selectedLength, setSelectedLength] = useState("medium");
  const [selectedLanguage, setSelectedLanguage] = useState("Thai");
  const [loadingArticle, setLoadingArticle] = useState(false);
  
  // 3 Formats Content State
  const [formats, setFormats] = useState<Record<ArticleFormatKey, string>>({
    longForm: "",
    socialPost: "",
    marketingAida: ""
  });
  const [selectedFormat, setSelectedFormat] = useState<ArticleFormatKey>("longForm");
  
  const [error, setError] = useState("");

  // Media State
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mediaMeta, setMediaMeta] = useState<MediaGenerationMetadata | null>(null);

  // Modals state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAutoPostModalOpen, setIsAutoPostModalOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isDraftSuccessOpen, setIsDraftSuccessOpen] = useState(false);

  // AI Usage Stats state
  const [stats, setStats] = useState<AIUsageStats | null>(null);

  // Load stats on mount
  const loadStats = async () => {
    try {
      const res = await getAIUsageStatsAction();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load AI usage stats", err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleGenerateArticle = async () => {
    if (!topic.trim()) {
      setError("กรุณากรอกหัวข้อบทความหลักก่อนสั่งเขียน");
      return;
    }

    setLoadingArticle(true);
    setError("");

    try {
      const res = await generateAIArticleAction(
        topic,
        selectedTone,
        selectedLength,
        selectedLanguage
      );
      if (res.success && res.formats) {
        setFormats({
          longForm: res.formats.longForm,
          socialPost: res.formats.socialPost,
          marketingAida: res.formats.marketingAida
        });
        setSelectedFormat("longForm");
        // Reload stats to reflect token usage
        await loadStats();
      } else {
        setError(res.error || "เกิดข้อผิดพลาดในการสร้างบทความ กรุณาตรวจสอบการตั้งค่าคีย์ API");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดการเชื่อมต่อเครือข่าย");
    } finally {
      setLoadingArticle(false);
    }
  };

  const handleEditorChange = (val: string) => {
    setFormats((prev) => ({
      ...prev,
      [selectedFormat]: val
    }));
  };

  // Open media creator immediately — English Visual Prompt is auto-extracted inside the modal
  const handleOpenMediaCreator = (type: "image" | "video") => {
    if (type === "image") setIsImageModalOpen(true);
    if (type === "video") setIsVideoModalOpen(true);
  };

  const handleSaveDraft = async () => {
    const activeContent = formats[selectedFormat];
    if (!activeContent.trim()) return;

    setSavingDraft(true);
    setError("");

    try {
      const res = await createDraftPost({
        content: activeContent,
        imageUrl: mediaUrl || undefined,
      });

      if (res.success) {
        setIsDraftSuccessOpen(true);
      } else {
        setError(res.error || "ไม่สามารถบันทึกแบบร่างได้");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกแบบร่าง");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSendToPublisher = (mode: "single" | "video") => {
    const activeContent = formats[selectedFormat];
    if (!activeContent.trim()) return;

    // Cache state in sessionStorage so large content/images never get truncated
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "vibepost_studio_preset",
          JSON.stringify({
            text: activeContent,
            mediaUrl: mediaUrl || "",
            mediaType: mediaType,
            mode: mode,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.error("Failed to cache studio preset in sessionStorage", e);
      }
    }

    // Send content and media parameters to AI Publisher page
    const textParam = encodeURIComponent(activeContent.substring(0, 300));
    const mediaParam = mediaUrl && !mediaUrl.startsWith("data:") ? encodeURIComponent(mediaUrl) : "";
    const typeParam = mediaType;
    
    // Route directly to AI Publisher wizard with pre-loaded state
    router.push(`/dashboard/multi-post?preset=studio&mode=${mode}&text=${textParam}&media=${mediaParam}&type=${typeParam}`);
  };

  return (
    <div className="p-2 md:p-6 space-y-8 animate-in fade-in duration-500 min-h-screen w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/60 pb-5 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl neu-tint-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              AI Creator <span className="text-primary">Studio</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-0.5">
              แต่งบทความระดับคุณภาพด้วย AI และเนรมิตรูปภาพหรือวิดีโอประกอบอย่างเสร็จสรรพในที่เดียว
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-destructive/12 border border-destructive/30 text-destructive rounded-2xl text-sm font-semibold max-w-7xl mx-auto">
          ⚠️ {error}
        </div>
      )}

      {/* AI Usage stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 neu-raised neu-mesh-card neu-grain p-6 rounded-3xl">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              ค่าใช้จ่ายสะสม (Est. Cost)
            </span>
            <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground tracking-tight flex items-baseline gap-1">
              ${stats.totalCost.toFixed(5)}
              <span className="text-xs font-bold text-muted-foreground">USD</span>
            </h3>
            <span className="text-[11px] text-primary font-bold block">
              ≈ {(stats.totalCost * 34.5).toFixed(2)} บาท (THB)
            </span>
          </div>

          <div className="space-y-1 border-l border-border/60 pl-5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Token ทั้งหมดที่ใช้งาน
            </span>
            <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground tracking-tight flex items-baseline gap-1">
              {stats.totalTokens.toLocaleString()}
              <span className="text-xs font-bold text-muted-foreground">Tokens</span>
            </h3>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold block">
              เรียกใช้งาน AI รวม {stats.totalCalls} ครั้ง
            </span>
          </div>

          <div className="space-y-1 border-l border-border/60 pl-5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              โมดูลเขียนข้อความ (Article)
            </span>
            <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
              {stats.articleCalls}{" "}
              <span className="text-xs font-bold text-muted-foreground">ครั้ง</span>
            </h3>
            <span className="text-[11px] text-muted-foreground font-medium block">
              Gemini &amp; LLM
            </span>
          </div>

          <div className="space-y-1 border-l border-border/60 pl-5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              โมดูลสร้างสื่อภาพ/วิดีโอ (Media)
            </span>
            <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
              {stats.imageCalls + stats.videoCalls}{" "}
              <span className="text-xs font-bold text-muted-foreground">ครั้ง</span>
            </h3>
            <span className="text-[11px] text-muted-foreground font-medium block">
              Imagen, Veo &amp; Stock
            </span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Left Column: Article Writer (col-span 7) */}
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
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-24 rounded-xl text-sm resize-none leading-relaxed"
                />
              </div>

              {/* Configs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    น้ำเสียง (Tone)
                  </Label>
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className="w-full neu-pressed bg-[var(--surface-recessed)] border border-border/60 text-foreground rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold [&>option]:bg-[var(--surface-elevated)] [&>option]:text-foreground"
                  >
                    {TONES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    ความยาวบทความ
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
                    ภาษา
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

              <Button
                variant="tactile"
                onClick={handleGenerateArticle}
                disabled={loadingArticle || !topic.trim()}
                className="w-full font-bold h-12 rounded-xl flex items-center justify-center gap-2"
              >
                {loadingArticle ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> กำลังเขียนบทความด้วย AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> เจเนอเรตเนื้อหา 3 รูปแบบพร้อมกัน
                  </>
                )}
              </Button>
            </div>

            {/* Generated Text Area with 3 Formats Ticks */}
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
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`p-3 text-left rounded-xl border text-xs transition-all duration-200 flex flex-col relative ${
                        isSelected
                          ? "neu-tint-primary"
                          : "neu-pressed border-border/60 text-muted-foreground hover:text-foreground"
                      } ${!hasContent ? "opacity-65" : ""}`}
                    >
                      <span className="font-bold flex items-center gap-1.5">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-black ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border bg-[var(--surface-recessed)] text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                        {fmt.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1">{fmt.desc}</span>
                    </button>
                  );
                })}
              </div>

              {loadingArticle ? (
                <div className="neu-pressed rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                  <h4 className="font-display font-bold text-foreground">กำลังแต่งบทความ 3 สไตล์...</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[280px]">
                    AI กำลังวิเคราะห์หัวข้อเพื่อประมวลผลบทความยาว แคปชันกระชับ และคำโฆษณาโครงสร้าง AIDA
                  </p>
                </div>
              ) : formats[selectedFormat] ? (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <Textarea
                    value={formats[selectedFormat]}
                    onChange={(e) => handleEditorChange(e.target.value)}
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
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-[220px]">
                    ป้อนหัวข้อหลักด้านบนและกดสั่งเจน เพื่อแต่งบทความของคุณในคราวเดียว
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Media Studio (col-span 5) */}
        <div className="lg:col-span-5 neu-raised neu-grain rounded-3xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
              <Film className="w-5 h-5 text-teal-500" />
              <h2 className="font-display font-bold text-foreground text-lg">
                2. ออกแบบรูปภาพหรือคลิปวิดีโอ
              </h2>
            </div>

            {mediaUrl ? (
              <div className="space-y-4 animate-in zoom-in-95">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border/60 shadow-md bg-black group">
                  {mediaType === "video" ? (
                    <video
                      src={mediaUrl}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      loop
                      muted
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="AI generated visual"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl(null);
                      setMediaMeta(null);
                    }}
                    className="absolute top-3 right-3 bg-destructive hover:brightness-110 text-destructive-foreground p-2 rounded-full shadow-lg transition-colors"
                    aria-label="ลบสื่อที่แนบ"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {mediaMeta?.usedFallback && (
                  <div className="p-3 bg-amber-500/12 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-300 font-semibold flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        ใช้โมเดลสำรอง: {mediaMeta.actualModel}
                      </span>
                      <span className="text-[11px] opacity-90">
                        {mediaMeta.fallbackReason}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-emerald-500/12 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  แนบไฟล์{mediaType === "video" ? "วิดีโอ" : "รูปภาพ"} AI สำเร็จแล้ว! พร้อมส่งออกเพื่อดีพลอย
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="neu"
                    onClick={() => handleOpenMediaCreator("image")}
                    className="font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-primary" /> แก้ Prompt / เจนรูปใหม่
                  </Button>
                  <Button
                    type="button"
                    variant="neu"
                    onClick={() => handleOpenMediaCreator("video")}
                    className="font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Film className="w-3.5 h-3.5 text-teal-500" /> สลับเป็นวิดีโอ AI
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border/70 rounded-2xl p-8 neu-pressed flex flex-col items-center justify-center text-center text-muted-foreground min-h-[350px]">
                <ImageIcon className="w-12 h-12 opacity-40 mb-3 animate-pulse" />
                <p className="font-display font-bold text-foreground/85 text-sm">เนรมิตสื่อประกอบบทความ</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mb-5">
                  เลือกสร้างรูปภาพด้วย AI หรือค้นหาคลิปวิดีโอภาพยนตร์เพื่อนำมาประกบบทความนี้
                </p>

                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                  <Button
                    variant="neu"
                    onClick={() => handleOpenMediaCreator("image")}
                    className="font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" /> 🎨 เจนรูป AI
                  </Button>
                  <Button
                    variant="neu"
                    onClick={() => handleOpenMediaCreator("video")}
                    className="font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Film className="w-4 h-4 text-teal-500" /> 🎬 เลือกวิดีโอ AI
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Export / Launch Zone */}
          {formats[selectedFormat].trim() && (
            <div className="pt-6 border-t border-border/60 space-y-4 animate-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  3. ส่งออกเพื่อเผยแพร่ (Publish &amp; Auto-Post)
                </Label>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-500/12 px-2.5 py-0.5 rounded-md border border-emerald-500/25">
                  ✨ แคปชันและสื่อพร้อมแล้ว
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <Button
                  variant="tactile"
                  onClick={() => setIsAutoPostModalOpen(true)}
                  className="sm:col-span-7 font-bold h-12 rounded-2xl flex items-center justify-center gap-2 text-xs group"
                >
                  <Rocket className="w-4 h-4 text-amber-300 animate-bounce" />
                  <span>🚀 เผยแพร่ทันที / ตั้งเวลา Auto-Post</span>
                </Button>

                <Button
                  variant="neu"
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  className="sm:col-span-5 text-primary font-bold h-12 rounded-2xl text-xs flex items-center justify-center gap-1.5"
                >
                  {savingDraft ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" /> 💾 บันทึกเป็นแบบร่าง (Draft)
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="neu"
                  onClick={() => handleSendToPublisher("single")}
                  className="flex-1 font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Settings2 className="w-3.5 h-3.5 text-muted-foreground" /> เปิดใน AI Publisher (ขั้นสูง)
                </Button>

                {mediaType === "video" && mediaUrl && (
                  <Button
                    variant="neu"
                    onClick={() => handleSendToPublisher("video")}
                    className="flex-1 text-teal-600 dark:text-teal-400 font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <Film className="w-3.5 h-3.5" /> โพสต์วิดีโอบรรยายคลิป
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Draft Success Dialog */}
      <Dialog open={isDraftSuccessOpen} onOpenChange={setIsDraftSuccessOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 text-center">
          <div className="py-4 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 neu-tint-primary rounded-full flex items-center justify-center">
              <BookmarkPlus className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="font-display text-xl font-extrabold text-foreground">
                บันทึกเข้าคลังแบบร่างเรียบร้อย! 🎉
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                คอนเทนต์ถูกเก็บไว้ใน <strong>&ldquo;คลังแบบร่างรอโพสต์ (Drafts Queue)&rdquo;</strong> คุณสามารถเปิดดูและคลิกสั่งโพสต์ได้ทุกเมื่อ
              </DialogDescription>
            </div>
            <div className="flex gap-3 pt-3 w-full">
              <Button
                variant="neu"
                onClick={() => setIsDraftSuccessOpen(false)}
                className="flex-1 text-xs font-bold rounded-xl h-11"
              >
                ✨ สร้างเนื้อหาต่อ
              </Button>
              <Button
                variant="tactile"
                onClick={() => router.push("/dashboard/history")}
                className="flex-1 text-xs font-bold rounded-xl h-11 flex items-center justify-center gap-1.5"
              >
                <Layers className="w-4 h-4" /> ไปดูคลังแบบร่าง
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Studio AutoPost Modal */}
      <StudioAutoPostModal
        isOpen={isAutoPostModalOpen}
        onClose={() => setIsAutoPostModalOpen(false)}
        content={formats[selectedFormat]}
        mediaUrl={mediaUrl}
        mediaType={mediaType}
        connections={connections}
        onOpenAdvancedWizard={() => {
          setIsAutoPostModalOpen(false);
          handleSendToPublisher(mediaType === "video" && mediaUrl ? "video" : "single");
        }}
      />

      {/* AI Modals */}
      <AIImageCreatorModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          void loadStats();
        }}
        onSelectImage={(url, meta) => {
          setMediaUrl(url);
          setMediaType("image");
          setMediaMeta(meta ?? null);
        }}
        sourceContent={formats[selectedFormat].trim() || topic.trim()}
      />

      <AIVideoStudioModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          void loadStats();
        }}
        onSelectVideo={(url, meta) => {
          setMediaUrl(url);
          setMediaType("video");
          setMediaMeta(meta ?? null);
        }}
        sourceContent={formats[selectedFormat].trim() || topic.trim()}
      />
    </div>
  );
}
