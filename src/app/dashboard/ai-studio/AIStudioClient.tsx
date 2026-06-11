"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateAIArticleAction } from "@/lib/actions/ai-generation";
import { AIImageCreatorModal } from "../multi-post/AIImageCreatorModal";
import { AIVideoStudioModal } from "../multi-post/AIVideoStudioModal";
import {
  Sparkles,
  PenTool,
  Film,
  Image as ImageIcon,
  Send,
  Loader2,
  Check,
  ArrowRight,
  BookOpen,
  X
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

export function AIStudioClient() {
  const router = useRouter();
  
  // Article State
  const [topic, setTopic] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [selectedLength, setSelectedLength] = useState("medium");
  const [selectedLanguage, setSelectedLanguage] = useState("Thai");
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [articleContent, setArticleContent] = useState("");
  const [error, setError] = useState("");

  // Media State
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  // Modals state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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
      if (res.success && res.article) {
        setArticleContent(res.article);
      } else {
        setError(res.error || "เกิดข้อผิดพลาดในการสร้างบทความ กรุณาตรวจสอบการตั้งค่าคีย์ API");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดการเชื่อมต่อเครือข่าย");
    } finally {
      setLoadingArticle(false);
    }
  };

  const handleSendToPublisher = (mode: "single" | "video") => {
    if (!articleContent.trim()) return;

    // Send content and media parameters to AI Publisher page
    const textParam = encodeURIComponent(articleContent);
    const mediaParam = mediaUrl ? encodeURIComponent(mediaUrl) : "";
    const typeParam = mediaType;
    
    // Route directly to AI Publisher wizard with pre-loaded state
    router.push(`/dashboard/multi-post?preset=studio&mode=${mode}&text=${textParam}&media=${mediaParam}&type=${typeParam}`);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 min-h-screen">
      {/* Header */}
      <header className="flex items-end justify-between border-b border-slate-100 pb-5">
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
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold max-w-4xl">
          ⚠️ {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
        {/* Left Column: Article Writer */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
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
                  <Sparkles className="w-5 h-5" /> สร้างสรรค์บทความด้วย AI
                </>
              )}
            </Button>
          </div>

          {/* Generated Text Area */}
          <div className="space-y-3">
            <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block">
              ผลลัพธ์บทความ (สามารถแก้ไขข้อความได้โดยตรง)
            </Label>
            {loadingArticle ? (
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center min-h-[250px] text-center">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                <h4 className="font-bold text-slate-700">แต่งบทความ...</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[280px]">
                  AI กำลังสังเคราะห์ข้อมูลและจัดวางลำดับเนื้อหาหัวข้อ บทนำ ประเด็นหลัก และแฮชแท็ก
                </p>
              </div>
            ) : articleContent ? (
              <Textarea
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                className="bg-white border-slate-200 text-slate-700 h-[280px] focus-visible:ring-purple-500 rounded-2xl text-sm leading-relaxed p-4 font-serif shadow-inner"
              />
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/30 flex flex-col items-center justify-center min-h-[250px] text-center text-slate-400">
                <BookOpen className="w-10 h-10 text-slate-300 mb-2" />
                <p className="font-semibold text-slate-500 text-xs">ยังไม่มีการสร้างบทความ</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[220px]">
                  กำหนดหัวข้อหลักด้านบนและกดสั่งเจน เพื่อแต่งบทความของคุณ
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Media Studio */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Film className="w-5 h-5 text-purple-600" />
              <h2 className="font-extrabold text-slate-800 text-lg">2. ออกแบบรูปภาพหรือคลิปวิดีโอ</h2>
            </div>

            {mediaUrl ? (
              <div className="space-y-4 animate-in zoom-in-95">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-black group">
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
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 bg-slate-50 flex flex-col items-center justify-center text-center text-slate-400 min-h-[220px]">
                <ImageIcon className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                <p className="font-bold text-slate-600 text-sm">เนรมิตสื่อประกอบบทความ</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[260px] mb-5">
                  เลือกสร้างรูปภาพด้วย AI หรือค้นหาคลิปวิดีโอภาพยนตร์เพื่อนำมาประกบบทความนี้
                </p>

                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                  <Button
                    onClick={() => setIsImageModalOpen(true)}
                    className="bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-xs h-11 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" /> 🎨 เจนรูป AI
                  </Button>
                  <Button
                    onClick={() => setIsVideoModalOpen(true)}
                    className="bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-xs h-11 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Film className="w-4 h-4 text-purple-500" /> 🎬 เลือกวิดีโอ AI
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Export / Launch Zone */}
          {articleContent.trim() && (
            <div className="pt-6 border-t border-slate-100 space-y-4 animate-in slide-in-from-bottom-3">
              <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block">
                3. ส่งออกเพื่อเผยแพร่ (Send to AI Publisher)
              </Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleSendToPublisher("single")}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold h-12 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> โพสต์รูปภาพเดี่ยว / รูปประกอบ
                </Button>

                {mediaType === "video" && mediaUrl && (
                  <Button
                    onClick={() => handleSendToPublisher("video")}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-red-600 hover:from-indigo-700 hover:to-red-700 text-white font-bold h-12 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Film className="w-4 h-4" /> โพสต์วิดีโอบรรยายคลิป
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Modals */}
      <AIImageCreatorModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelectImage={(url) => {
          setMediaUrl(url);
          setMediaType("image");
        }}
      />

      <AIVideoStudioModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSelectVideo={(url) => {
          setMediaUrl(url);
          setMediaType("video");
        }}
      />
    </div>
  );
}
