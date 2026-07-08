"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateAICaptionsFromMediaAction } from "@/lib/actions/ai-generation";
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Film,
  X,
  Copy,
  Check,
  Send,
  Loader2,
  Wand2,
  RotateCcw,
} from "lucide-react";

const CAPTION_STYLES = [
  {
    id: "playful",
    label: "🎉 Playful",
    desc: "สนุก เป็นกันเอง",
    gradient: "from-yellow-400 to-orange-400",
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    textColor: "text-orange-800",
  },
  {
    id: "emotional",
    label: "💖 Emotional",
    desc: "ลึกซึ้ง สัมผัสใจ",
    gradient: "from-pink-400 to-rose-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    badge: "bg-pink-100 text-pink-700",
    textColor: "text-pink-800",
  },
  {
    id: "promotional",
    label: "🚀 Promotional",
    desc: "โปรโมทสินค้า ยอดขายพุ่ง",
    gradient: "from-indigo-500 to-purple-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
    textColor: "text-indigo-800",
  },
  {
    id: "minimalist",
    label: "✨ Minimalist",
    desc: "กระชับ สั้น ทรงพลัง",
    gradient: "from-slate-400 to-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-700",
    textColor: "text-slate-800",
  },
  {
    id: "informative",
    label: "💡 Informative",
    desc: "ให้ข้อมูล ความรู้ สาระ",
    gradient: "from-teal-400 to-cyan-500",
    bg: "bg-teal-50",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-700",
    textColor: "text-teal-800",
  },
];

const LANGUAGES = [
  { id: "Thai", label: "🇹🇭 ภาษาไทย" },
  { id: "English", label: "🇬🇧 English" },
  { id: "Japanese", label: "🇯🇵 日本語" },
  { id: "Chinese (Simplified)", label: "🇨🇳 中文" },
];

type Captions = {
  playful: string;
  emotional: string;
  promotional: string;
  minimalist: string;
  informative: string;
};

export function AICaptionClient() {
  const router = useRouter();

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Generation state
  const [context, setContext] = useState("");
  const [language, setLanguage] = useState("Thai");
  const [isGenerating, setIsGenerating] = useState(false);
  const [captions, setCaptions] = useState<Captions | null>(null);
  const [genError, setGenError] = useState("");

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/webm", "video/quicktime",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("ไฟล์ที่รองรับ: JPEG, PNG, GIF, WEBP, MP4, WEBM, MOV");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("ไฟล์ต้องมีขนาดไม่เกิน 50MB");
      return;
    }

    setUploadError("");
    setUploadedFile(file);
    setCaptions(null);
    setGenError("");

    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");

    // Create local preview URL
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Upload to server
    setIsUploading(true);
    setUploadedFileUrl(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      setUploadedFileUrl(data.url);
    } catch (err: any) {
      setUploadError("อัปโหลดไม่สำเร็จ: " + err.message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleClearMedia = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadedFileUrl(null);
    setCaptions(null);
    setGenError("");
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!uploadedFileUrl) {
      setGenError("กรุณาอัปโหลดรูปภาพหรือวิดีโอก่อน");
      return;
    }
    setIsGenerating(true);
    setGenError("");
    setCaptions(null);

    try {
      const res = await generateAICaptionsFromMediaAction(
        uploadedFileUrl,
        mediaType,
        context,
        language
      );
      if (res.success && res.captions) {
        setCaptions(res.captions as Captions);
      } else {
        setGenError(res.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch (err: any) {
      setGenError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleSendToPublisher = (captionText: string) => {
    const textParam = encodeURIComponent(captionText);
    const mediaParam = uploadedFileUrl ? encodeURIComponent(uploadedFileUrl) : "";
    const typeParam = mediaType;
    const mode = mediaType === "video" ? "video" : "single";
    router.push(
      `/dashboard/multi-post?preset=studio&mode=${mode}&text=${textParam}&media=${mediaParam}&type=${typeParam}`
    );
  };

  const hasResults = captions !== null;

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 min-h-screen w-full max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 mb-2 tracking-tight flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-fuchsia-600 animate-pulse" />
            AI Caption Generator
          </h1>
          <p className="text-slate-500 font-medium">
            อัปโหลดรูปภาพหรือวิดีโอ แล้วให้ AI คิดแคปชันสไตล์ต่างๆ ให้คุณในคลิกเดียว
          </p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Left: Upload & Options */}
        <div className="lg:col-span-5 space-y-5">
          {/* Upload Zone */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
              <Upload className="w-5 h-5 text-fuchsia-600" />
              <h2 className="font-extrabold text-slate-800 text-lg">1. อัปโหลดสื่อของคุณ</h2>
            </div>

            {!previewUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[260px] p-8 group
                  ${isDragOver
                    ? "border-fuchsia-400 bg-fuchsia-50 scale-[1.01]"
                    : "border-slate-300 bg-slate-50 hover:border-fuchsia-300 hover:bg-fuchsia-50/40"
                  }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all
                  ${isDragOver ? "bg-fuchsia-100" : "bg-slate-100 group-hover:bg-fuchsia-100"}`}>
                  <Upload className={`w-8 h-8 transition-colors ${isDragOver ? "text-fuchsia-600" : "text-slate-400 group-hover:text-fuchsia-500"}`} />
                </div>
                <p className="font-bold text-slate-700 text-sm mb-1">
                  ลากวางไฟล์ที่นี่ หรือคลิกเพื่อเลือก
                </p>
                <p className="text-xs text-slate-400 max-w-[220px]">
                  รองรับ JPG, PNG, GIF, WEBP, MP4, WEBM, MOV (สูงสุด 50MB)
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 font-medium shadow-xs">
                    <ImageIcon className="w-3.5 h-3.5 text-fuchsia-500" /> รูปภาพ
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 font-medium shadow-xs">
                    <Film className="w-3.5 h-3.5 text-purple-500" /> วิดีโอ
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                  onChange={handleInputChange}
                />
              </div>
            ) : (
              <div className="space-y-3 animate-in zoom-in-95 duration-200">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-black group">
                  {mediaType === "video" ? (
                    <video
                      src={previewUrl}
                      className="w-full max-h-[280px] object-contain"
                      controls
                      muted
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Uploaded media"
                      className="w-full max-h-[280px] object-contain"
                    />
                  )}
                  <button
                    onClick={handleClearMedia}
                    className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {/* Media type badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-md
                      ${mediaType === "video" ? "bg-purple-600 text-white" : "bg-fuchsia-600 text-white"}`}>
                      {mediaType === "video" ? "🎬 Video" : "🖼️ Image"}
                    </span>
                  </div>
                </div>

                {isUploading ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-semibold flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    กำลังอัปโหลดไฟล์...
                  </div>
                ) : uploadedFileUrl ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    อัปโหลดสำเร็จ! พร้อมสำหรับการวิเคราะห์ AI
                  </div>
                ) : null}

                <button
                  onClick={handleClearMedia}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> เปลี่ยนไฟล์
                </button>
              </div>
            )}

            {uploadError && (
              <p className="mt-3 text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded-xl p-3">
                ⚠️ {uploadError}
              </p>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-fuchsia-600" />
              <h2 className="font-extrabold text-slate-800 text-lg">2. ตั้งค่าและปรับแต่ง</h2>
            </div>

            <div>
              <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                บริบทเพิ่มเติม (Context) — ไม่บังคับ
              </Label>
              <Textarea
                placeholder="เช่น: สินค้าคือกาแฟดริปออร์แกนิก เหมาะสำหรับคนรักสุขภาพ ราคา 299 บาท..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 h-20 focus-visible:ring-fuchsia-500 rounded-xl text-sm resize-none leading-relaxed"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                ใส่รายละเอียดสินค้า แบรนด์ หรือบริบทที่ต้องการให้ AI คำนึงถึงเมื่อสร้างแคปชัน
              </p>
            </div>

            <div>
              <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                ภาษาของแคปชัน
              </Label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-bold"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>{lang.label}</option>
                ))}
              </select>
            </div>

            {genError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                ⚠️ {genError}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isUploading || !uploadedFileUrl}
              className="w-full bg-gradient-to-r from-fuchsia-600 via-pink-600 to-orange-500 hover:from-fuchsia-700 hover:via-pink-700 hover:to-orange-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-fuchsia-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI กำลังคิดแคปชัน 5 สไตล์...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  สร้างแคปชัน 5 สไตล์ด้วย AI
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right: Caption Results */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <Sparkles className="w-5 h-5 text-fuchsia-600 animate-pulse" />
              <h2 className="font-extrabold text-slate-800 text-lg">3. แคปชัน 5 สไตล์ที่ AI คิดให้</h2>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-100 to-pink-100 flex items-center justify-center">
                    <Wand2 className="w-10 h-10 text-fuchsia-600 animate-bounce" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full animate-ping" />
                </div>
                <h4 className="font-bold text-slate-700 text-lg mb-2">AI กำลังวิเคราะห์สื่อของคุณ...</h4>
                <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed">
                  Gemini AI กำลังมองเห็นภาพ/วิดีโอของคุณและคิดแคปชันแบบ 5 สไตล์พร้อมกัน รอสักครู่
                </p>
                {/* Skeleton loaders */}
                <div className="w-full max-w-md mt-8 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            ) : hasResults ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
                {CAPTION_STYLES.map((style) => {
                  const text = captions![style.id as keyof Captions] || "";
                  const isCopied = copiedId === style.id;
                  return (
                    <div
                      key={style.id}
                      className={`relative border rounded-2xl p-5 transition-all ${style.border} ${style.bg}`}
                    >
                      {/* Style header */}
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${style.badge}`}>
                            {style.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{style.desc}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleCopy(text, style.id)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border
                              ${isCopied
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                          >
                            {isCopied ? (
                              <><Check className="w-3.5 h-3.5" /> คัดลอกแล้ว!</>
                            ) : (
                              <><Copy className="w-3.5 h-3.5" /> คัดลอก</>
                            )}
                          </button>
                          {uploadedFileUrl && (
                            <button
                              onClick={() => handleSendToPublisher(text)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border bg-white border-slate-200 text-slate-600 hover:bg-fuchsia-600 hover:text-white hover:border-fuchsia-600"
                            >
                              <Send className="w-3.5 h-3.5" /> โพสต์
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Caption text */}
                      {text ? (
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${style.textColor} font-medium`}>
                          {text}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">ไม่ได้รับแคปชันสไตล์นี้</p>
                      )}

                      {/* Gradient accent bar */}
                      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b ${style.gradient}`} />
                    </div>
                  );
                })}

                {/* Regenerate button */}
                <Button
                  onClick={handleGenerate}
                  variant="outline"
                  className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-11 font-bold text-sm flex items-center gap-2 mt-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  สร้างแคปชันชุดใหม่ (Regenerate)
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-slate-400">
                {/* Illustration */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-fuchsia-50 to-pink-100 flex items-center justify-center shadow-inner">
                    <Wand2 className="w-12 h-12 text-fuchsia-300" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
                <p className="font-bold text-slate-500 text-base">ยังไม่มีแคปชัน</p>
                <p className="text-xs text-slate-400 mt-2 max-w-[260px] leading-relaxed">
                  อัปโหลดรูปภาพหรือวิดีโอของคุณแล้วกดปุ่ม{" "}
                  <span className="font-bold text-fuchsia-500">"สร้างแคปชัน 5 สไตล์"</span>{" "}
                  เพื่อให้ AI วิเคราะห์และสร้างแคปชันให้ทันที
                </p>

                {/* Style preview chips */}
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  {CAPTION_STYLES.map((s) => (
                    <span
                      key={s.id}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border ${s.border} ${s.badge}`}
                    >
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
