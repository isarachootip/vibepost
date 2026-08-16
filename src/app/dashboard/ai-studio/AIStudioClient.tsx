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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sparkles,
  PenTool,
  Film,
  Image as ImageIcon,
  Send,
  Loader2,
  Check,
  BookOpen,
  X,
  Coins,
  History,
  TrendingUp,
  Rocket,
  Settings2,
  BookmarkPlus,
  Layers,
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

export function AIStudioClient({ connections = [] }: { connections?: Connection[] }) {
  const router = useRouter();
  
  // Article State
  const [topic, setTopic] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [selectedLength, setSelectedLength] = useState("medium");
  const [selectedLanguage, setSelectedLanguage] = useState("Thai");
  const [loadingArticle, setLoadingArticle] = useState(false);
  
  // 3 Formats Content State
  const [formats, setFormats] = useState({
    longForm: "",
    socialPost: "",
    marketingAida: ""
  });
  const [selectedFormat, setSelectedFormat] = useState<"longForm" | "socialPost" | "marketingAida">("longForm");
  
  const [error, setError] = useState("");

  // Media State
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  // Modals state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAutoPostModalOpen, setIsAutoPostModalOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isDraftSuccessOpen, setIsDraftSuccessOpen] = useState(false);

  // Copy Prompt Dialog state
  const [isConfirmCopyOpen, setIsConfirmCopyOpen] = useState(false);
  const [copyTargetType, setCopyTargetType] = useState<"image" | "video" | null>(null);
  const [modalInitialPrompt, setModalInitialPrompt] = useState("");

  // AI Usage Stats state
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load stats on mount
  const loadStats = async () => {
    try {
      const res = await getAIUsageStatsAction();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load AI usage stats", err);
    } finally {
      setLoadingStats(false);
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
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดการเชื่อมต่อเครือข่าย");
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

  // Clean prompt helper to extract core theme / headline
  const cleanForPrompt = (text: string) => {
    let clean = text.replace(/#\w+/g, ""); // Remove hashtags
    const lines = clean.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      // Return first line minus list numbering
      return lines[0].replace(/^[0-9.\-\s]+/, "");
    }
    return text.substring(0, 100);
  };

  // Handle open media creator with prompt confirmation
  const handleOpenMediaCreator = (type: "image" | "video") => {
    const activeText = formats[selectedFormat];
    if (activeText && activeText.trim()) {
      setCopyTargetType(type);
      setIsConfirmCopyOpen(true);
    } else {
      setModalInitialPrompt("");
      if (type === "image") setIsImageModalOpen(true);
      if (type === "video") setIsVideoModalOpen(true);
    }
  };

  const handleConfirmCopyPrompt = (useCopy: boolean) => {
    setIsConfirmCopyOpen(false);
    if (useCopy) {
      const activeText = formats[selectedFormat];
      const cleanedPrompt = cleanForPrompt(activeText);
      setModalInitialPrompt(cleanedPrompt);
    } else {
      setModalInitialPrompt("");
    }

    if (copyTargetType === "image") setIsImageModalOpen(true);
    if (copyTargetType === "video") setIsVideoModalOpen(true);
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
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกแบบร่าง");
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
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 min-h-screen w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-red-600 mb-2 tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
            AI Creator Studio
          </h1>
          <p className="text-slate-500 font-medium">
            แต่งบทความระดับคุณภาพด้วย AI และเนรมิตรูปภาพหรือวิดีโอประกอบอย่างเสร็จสรรพในที่เดียว
          </p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold max-w-7xl mx-auto shadow-xs">
          ⚠️ {error}
        </div>
      )}

      {/* AI Usage stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 bg-gradient-to-br from-purple-50/70 via-slate-50 to-indigo-50/70 border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">ค่าใช้จ่ายสะสม (Est. Cost)</span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
              ${stats.totalCost.toFixed(5)}
              <span className="text-xs font-bold text-slate-400">USD</span>
            </h3>
            <span className="text-[10px] text-purple-600 font-black block">
              ≈ {(stats.totalCost * 34.5).toFixed(2)} บาท (THB)
            </span>
          </div>

          <div className="space-y-1 border-l border-slate-200/80 pl-5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Token ทั้งหมดที่ใช้งาน</span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
              {stats.totalTokens.toLocaleString()}
              <span className="text-xs font-bold text-slate-400">Tokens</span>
            </h3>
            <span className="text-[10px] text-indigo-600 font-black block">
              เรียกใช้งาน AI รวม {stats.totalCalls} ครั้ง
            </span>
          </div>

          <div className="space-y-1 border-l border-slate-200/80 pl-5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">โมดูลเขียนข้อความ (Article)</span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {stats.articleCalls}{" "}
              <span className="text-xs font-bold text-slate-400">ครั้ง</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold block">
              Gemini & GPT-3.5
            </span>
          </div>

          <div className="space-y-1 border-l border-slate-200/80 pl-5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">โมดูลสร้างสื่อภาพ/วิดีโอ (Media)</span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {stats.imageCalls + stats.videoCalls}{" "}
              <span className="text-xs font-bold text-slate-400">ครั้ง</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold block">
              Imagen 4, DALL-E & Pexels
            </span>
          </div>
        </div>
      )}

      {/* Main Grid - Redesigned to utilize wide screen space */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Left Column: Article Writer (col-span 7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <PenTool className="w-5 h-5 text-purple-600" />
              <h2 className="font-extrabold text-slate-800 text-lg">1. เขียนบทความและข้อความโพสต์</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                  หัวข้อหรือคำอธิบายเนื้อหาที่ต้องการ
                </Label>
                <Textarea
                  placeholder="เช่น แนะนำผลิตภัณฑ์อาหารเสริมคอลลาเจนตัวใหม่ ช่วยเรื่องผิวพรรณสดใสภายใน 14 วัน..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 h-24 focus-visible:ring-purple-500 rounded-xl text-sm resize-none leading-relaxed"
                />
              </div>

              {/* Configs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                    น้ำเสียง (Tone)
                  </Label>
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  >
                    {TONES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                    ความยาวบทความ
                  </Label>
                  <select
                    value={selectedLength}
                    onChange={(e) => setSelectedLength(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
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
                    ภาษา
                  </Label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
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
                onClick={handleGenerateArticle}
                disabled={loadingArticle || !topic.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
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
              <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block">
                ผลลัพธ์บทความ (เลือกรูปแบบที่ต้องการและพิมพ์แก้ไขได้โดยตรง)
              </Label>
              
              {/* 3 Formats Card selectors (ticks) */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "longForm", label: "📄 บทความยาว", desc: "Long-form" },
                  { id: "socialPost", label: "📱 แคปชันโซเชียล", desc: "Short Caption" },
                  { id: "marketingAida", label: "🎯 โฆษณา AIDA", desc: "Marketing copy" }
                ].map((fmt) => {
                  const hasContent = !!formats[fmt.id as keyof typeof formats];
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.id as any)}
                      className={`p-3 text-left rounded-xl border text-xs transition-all duration-200 flex flex-col relative ${
                        selectedFormat === fmt.id
                          ? "border-purple-600 bg-purple-50/50 text-purple-900 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                      } ${!hasContent ? "opacity-60" : ""}`}
                    >
                      <span className="font-bold flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-black ${
                          selectedFormat === fmt.id 
                            ? "bg-purple-600 border-purple-600 text-white" 
                            : "border-slate-300 bg-white text-transparent"
                        }`}>
                          ✓
                        </span>
                        {fmt.label}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">{fmt.desc}</span>
                    </button>
                  );
                })}
              </div>

              {loadingArticle ? (
                <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center min-h-[300px] text-center">
                  <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                  <h4 className="font-bold text-slate-700">กำลังแต่งบทความ 3 สไตล์...</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[280px]">
                    AI กำลังวิเคราะห์หัวข้อเพื่อประมวลผลบทความยาว แคปชันกระชับ และคำโฆษณาโครงสร้าง AIDA
                  </p>
                </div>
              ) : formats[selectedFormat] ? (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <Textarea
                    value={formats[selectedFormat]}
                    onChange={(e) => handleEditorChange(e.target.value)}
                    className="bg-white border-slate-200 text-slate-700 h-[320px] focus-visible:ring-purple-500 rounded-2xl text-sm leading-relaxed p-4 font-sans shadow-inner resize-none"
                  />
                  <div className="text-[10px] text-slate-400 text-right font-medium">
                    ความยาวของรูปแบบที่เลือก: {formats[selectedFormat].length} ตัวอักษร
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/30 flex flex-col items-center justify-center min-h-[300px] text-center text-slate-400">
                  <BookOpen className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-500 text-xs">ยังไม่มีการสร้างบทความ</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[220px]">
                    ป้อนหัวข้อหลักด้านบนและกดสั่งเจน เพื่อแต่งบทความของคุณในคราวเดียว
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Media Studio (col-span 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Film className="w-5 h-5 text-purple-600" />
              <h2 className="font-extrabold text-slate-800 text-lg">2. ออกแบบรูปภาพหรือคลิปวิดีโอ</h2>
            </div>

            {mediaUrl ? (
              <div className="space-y-4 animate-in zoom-in-95">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-black group">
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
                    onClick={() => {
                      setMediaUrl(null);
                    }}
                    className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  แนบไฟล์{mediaType === "video" ? "วิดีโอ" : "รูปภาพ"} AI สำเร็จแล้ว! พร้อมส่งออกเพื่อดีพลอย
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 bg-slate-50 flex flex-col items-center justify-center text-center text-slate-400 min-h-[350px]">
                <ImageIcon className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                <p className="font-bold text-slate-600 text-sm">เนรมิตสื่อประกอบบทความ</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[260px] mb-5">
                  เลือกสร้างรูปภาพด้วย AI หรือค้นหาคลิปวิดีโอภาพยนตร์เพื่อนำมาประกบบทความนี้
                </p>

                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                  <Button
                    onClick={() => handleOpenMediaCreator("image")}
                    className="bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-xs h-11 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" /> 🎨 เจนรูป AI
                  </Button>
                  <Button
                    onClick={() => handleOpenMediaCreator("video")}
                    className="bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-xs h-11 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Film className="w-4 h-4 text-purple-500" /> 🎬 เลือกวิดีโอ AI
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Export / Launch Zone */}
          {formats[selectedFormat].trim() && (
            <div className="pt-6 border-t border-slate-100 space-y-4 animate-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block">
                  3. ส่งออกเพื่อเผยแพร่ (Publish & Auto-Post)
                </Label>
                <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-md border border-green-200">
                  ✨ แคปชันและสื่อพร้อมแล้ว
                </span>
              </div>

              {/* Main Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* 1-Click Fast AutoPost Action */}
                <Button
                  onClick={() => setIsAutoPostModalOpen(true)}
                  className="sm:col-span-7 bg-gradient-to-r from-purple-600 via-indigo-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-extrabold h-13 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs group"
                >
                  <Rocket className="w-4 h-4 text-yellow-300 animate-bounce" />
                  <span>🚀 เผยแพร่ทันที / ตั้งเวลา Auto-Post</span>
                </Button>

                {/* Save as Draft Button */}
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  className="sm:col-span-5 border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-purple-800 font-black h-13 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  {savingDraft ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4 text-purple-600" /> 💾 บันทึกเป็นแบบร่าง (Draft)
                    </>
                  )}
                </Button>
              </div>

              {/* Advanced / Alternative Options */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSendToPublisher("single")}
                  className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Settings2 className="w-3.5 h-3.5 text-slate-400" /> เปิดใน AI Publisher (ขั้นสูง)
                </Button>

                {mediaType === "video" && mediaUrl && (
                  <Button
                    variant="outline"
                    onClick={() => handleSendToPublisher("video")}
                    className="flex-1 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50 text-indigo-700 font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <Film className="w-3.5 h-3.5 text-indigo-500" /> โพสต์วิดีโอบรรยายคลิป
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Copy Prompt Dialog */}
      <Dialog open={isConfirmCopyOpen} onOpenChange={setIsConfirmCopyOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 text-slate-800 rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
              ต้องการดึงเนื้อหาไปเป็น Prompt หรือไม่?
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-xs mt-1.5 leading-relaxed">
              ระบบพบเนื้อหาบทความที่คุณเลือก คุณต้องการคัดลอกใจความสำคัญหลักจากบทความไปใช้เป็นคำอธิบายในการ{" "}
              {copyTargetType === "image" ? "เจนรูปภาพ" : "ค้นหาวิดีโอ"} โดยอัตโนมัติหรือไม่?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-5 justify-end">
            <Button
              variant="outline"
              onClick={() => handleConfirmCopyPrompt(false)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl h-10 px-4"
            >
              ไม่ใช้ (เริ่มใหม่เอง)
            </Button>
            <Button
              onClick={() => handleConfirmCopyPrompt(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm"
            >
              ใช่ คัดลอกและเริ่ม
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Draft Success Dialog */}
      <Dialog open={isDraftSuccessOpen} onOpenChange={setIsDraftSuccessOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-2xl text-center">
          <div className="py-4 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center border-4 border-purple-100 shadow-inner">
              <BookmarkPlus className="w-8 h-8 text-purple-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black text-slate-900">
                บันทึกเข้าคลังแบบร่างเรียบร้อย! 🎉
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                คอนเทนต์ถูกเก็บไว้ใน <strong>"คลังแบบร่างรอโพสต์ (Drafts Queue)"</strong> คุณสามารถเปิดดูและคลิกสั่งโพสต์ได้ทุกเมื่อ
              </DialogDescription>
            </div>
            <div className="flex gap-3 pt-3 w-full">
              <Button
                variant="outline"
                onClick={() => setIsDraftSuccessOpen(false)}
                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl h-11"
              >
                ✨ สร้างเนื้อหาต่อ
              </Button>
              <Button
                onClick={() => router.push("/dashboard/history")}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl h-11 shadow-md flex items-center justify-center gap-1.5"
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
          loadStats(); // Reload stats after modal actions
        }}
        onSelectImage={(url) => {
          setMediaUrl(url);
          setMediaType("image");
        }}
        initialPrompt={modalInitialPrompt}
      />

      <AIVideoStudioModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          loadStats(); // Reload stats after modal actions
        }}
        onSelectVideo={(url) => {
          setMediaUrl(url);
          setMediaType("video");
        }}
        initialPrompt={modalInitialPrompt}
      />
    </div>
  );
}
