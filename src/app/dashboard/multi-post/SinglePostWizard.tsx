"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { generateAIPost, createScheduledPost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { 
  CalendarIcon, Sparkles, Send, CheckCircle2, RefreshCcw, 
  Image as ImageIcon, Bot, LayoutTemplate, Clock, Film, PenTool, Loader2,
  Check, ArrowLeft, Globe
} from "lucide-react";

// Modals
import { AIImageCreatorModal } from "./AIImageCreatorModal";
import { AIVideoStudioModal } from "./AIVideoStudioModal";
import { AIArticleWriterModal } from "./AIArticleWriterModal";

type Connection = {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
};

function SinglePostWizardInner({ 
  connections, 
  defaultMediaType = "image" 
}: { 
  connections: Connection[]; 
  defaultMediaType?: "image" | "video";
}) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [isFromStudio, setIsFromStudio] = useState(false);
  
  // Step 1 State
  const [topic, setTopic] = useState("");
  const [variantCount, setVariantCount] = useState("3");
  const [language, setLanguage] = useState("Thai");
  
  // Unified media state
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">(defaultMediaType);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Modal Open states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  
  // Step 2 & 3 State
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState("");
  
  // Step 4 State
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [scheduleHour, setScheduleHour] = useState(String(new Date().getHours()).padStart(2, "0"));
  const [scheduleMinute, setScheduleMinute] = useState("00");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null);
  const [error, setError] = useState("");

  // Auto-select channels on mount if active
  useEffect(() => {
    if (selectedChannels.length === 0 && connections.length > 0) {
      setSelectedChannels(connections.filter(c => c.isActive).map(c => c.id));
    }
  }, [connections]);

  // Load preset parameters from AI Studio (via sessionStorage and/or searchParams)
  useEffect(() => {
    let presetLoaded = false;

    // 1. First check sessionStorage for full un-truncated state
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("vibepost_studio_preset");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.text) {
            setSelectedContent(parsed.text);
            setTopic(parsed.text);
            if (parsed.mediaUrl) {
              setMediaUrl(parsed.mediaUrl);
              setMediaPreview(parsed.mediaUrl);
              setMediaType(parsed.mediaType || "image");
            }
            setIsFromStudio(true);
            setStep(3); // Jump directly to Review & Schedule Step
            presetLoaded = true;
          }
        }
      } catch (e) {
        console.error("Error reading studio preset from sessionStorage", e);
      }
    }

    // 2. Fallback to URL searchParams if not loaded from sessionStorage
    if (!presetLoaded) {
      const preset = searchParams.get("preset");
      if (preset === "studio") {
        const text = searchParams.get("text");
        const media = searchParams.get("media");
        const type = searchParams.get("type");
        const mode = searchParams.get("mode");

        if (text) {
          const decodedText = decodeURIComponent(text);
          setSelectedContent(decodedText);
          setTopic(decodedText);
          setIsFromStudio(true);
          setStep(3);
        }

        if (media) {
          const decodedMedia = decodeURIComponent(media);
          setMediaUrl(decodedMedia);
          setMediaPreview(decodedMedia);
          setMediaType(type === "video" ? "video" : "image");
        } else if (mode === "video") {
          setMediaType("video");
        }
      }
    }
  }, [searchParams]);

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect media type
    const isVideoFile = file.type.startsWith("video/");
    setMediaType(isVideoFile ? "video" : "image");

    // Show preview immediately (local blob for display only)
    const localPreview = URL.createObjectURL(file);
    setMediaPreview(localPreview);
    setMediaUrl(null);
    setUploadError("");
    setIsUploading(true);

    try {
      // Upload to server to get a real public URL
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }

      setMediaUrl(data.url); // This is the public server URL Facebook can access
    } catch (err: any) {
      setUploadError(`Upload failed: ${err.message}`);
      setMediaPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (selectedChannels.length === 0) {
      setError("Please select at least one social channel.");
      return;
    }
    if (!topic.trim()) {
      setError("Please enter a topic or keyword.");
      return;
    }

    setError("");
    setStep(2);
    setIsGenerating(true);

    const res = await generateAIPost(topic, parseInt(variantCount) || 3, language);
    setIsGenerating(false);

    if (res.success) {
      setVariants(res.variants);
      if (res.variants.length > 0) {
        setSelectedContent(res.variants[0]);
      }
      setStep(3);
    } else {
      setError(res.error || "Failed to generate content.");
      setStep(1); // Go back if error
    }
  };

  const handlePublish = async (isPostNow: boolean) => {
    if (selectedChannels.length === 0) {
      setError("กรุณาเลือกช่องทางโซเชียลมีเดียอย่างน้อย 1 ช่องทาง");
      return;
    }

    if (!selectedContent.trim()) {
      setError("เนื้อหาโพสต์ต้องไม่ว่างเปล่า");
      return;
    }

    setError("");
    setIsPublishing(true);

    // Combine selected date + time
    let publishDate: Date;
    if (isPostNow) {
      publishDate = new Date();
    } else {
      publishDate = date ? new Date(date) : new Date();
      publishDate.setHours(parseInt(scheduleHour), parseInt(scheduleMinute), 0, 0);
    }

    const res = await createScheduledPost({
      content: selectedContent,
      scheduledTime: publishDate,
      targetConnectionIds: selectedChannels,
      imageUrl: mediaUrl || undefined, // Pass mediaUrl (supports both image and video urls)
    });

    setIsPublishing(false);

    if (res.success) {
      setPublishSuccess(true);
      setScheduledDateTime(publishDate);
      setStep(4);
      // Clean up cached studio preset
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("vibepost_studio_preset");
      }
    } else {
      setError(res.error || "Failed to schedule post.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 px-4 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-red-600 -z-10 rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
        
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 border-2 ${step >= num ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}>
            {num}
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden min-h-[400px]">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Input Phase */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">1. Select Target Channels</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {connections.map((conn) => {
                  const isActive = selectedChannels.includes(conn.id);
                  return (
                    <button
                      key={conn.id}
                      onClick={() => toggleChannel(conn.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isActive 
                          ? 'border-red-600 bg-red-50 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{conn.platform}</span>
                        {isActive && <CheckCircle2 className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="text-sm font-semibold text-slate-800 truncate">{conn.accountName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                  <h3 className="text-lg font-bold text-slate-800">2. Topic & Instructions</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsArticleModalOpen(true)}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold flex items-center gap-1 py-1 h-7 rounded-lg transition-all"
                  >
                    <PenTool className="w-3.5 h-3.5" /> ✍️ AI Article Writer
                  </Button>
                </div>
                <Textarea 
                  placeholder="e.g. โปรโมชั่นหน้าร้อน ซื้อ 1 แถม 1..." 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 h-32 resize-none focus-visible:ring-red-600 rounded-xl"
                />
                
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wide">Variations to Generate</label>
                  <select 
                    value={variantCount} 
                    onChange={(e) => setVariantCount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-medium"
                  >
                    <option value="1">1 Option</option>
                    <option value="3">3 Options</option>
                    <option value="5">5 Options</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wide">🌐 Language / ภาษา</label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-medium"
                  >
                    <option value="Thai">🇹🇭 ภาษาไทย</option>
                    <option value="English">🇬🇧 English</option>
                    <option value="Chinese (Simplified)">🇨🇳 中文 (简体)</option>
                    <option value="Chinese (Traditional)">🇹🇼 中文 (繁體)</option>
                    <option value="Japanese">🇯🇵 日本語</option>
                    <option value="Korean">🇰🇷 한국어</option>
                    <option value="Arabic">🇸🇦 العربية</option>
                    <option value="French">🇫🇷 Français</option>
                    <option value="German">🇩🇪 Deutsch</option>
                    <option value="Spanish">🇪🇸 Español</option>
                    <option value="Malay">🇲🇾 Bahasa Melayu</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">3. Attach Media (รูปภาพ หรือ วิดีโอ)</h3>
                <label className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors h-32 flex flex-col items-center justify-center bg-slate-50 cursor-pointer block ${isUploading ? 'border-blue-300 bg-blue-50' : mediaUrl ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input 
                    type="file" 
                    accept="image/*,video/*" 
                    className="hidden" 
                    onChange={handleMediaUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <>
                      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-sm font-medium text-blue-600">Uploading to server...</p>
                    </>
                  ) : mediaUrl ? (
                    <>
                      {mediaType === "video" ? (
                        <Film className="w-8 h-8 text-green-500 mb-2" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-green-500 mb-2" />
                      )}
                      <p className="text-sm font-medium text-green-600">✅ {mediaType === "video" ? "วิดีโอ" : "รูปภาพ"} แนบสำเร็จแล้ว!</p>
                      <p className="text-xs text-slate-400 mt-1">คลิกเพื่อเปลี่ยนไฟล์</p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-600">คลิกเพื่ออัปโหลด รูป หรือ วิดีโอ</p>
                      <p className="text-xs text-slate-400 mt-1">(รองรับ MP4, WEBM, JPG, PNG)</p>
                    </>
                  )}
                </label>
                {uploadError && (
                  <p className="mt-2 text-sm text-red-500">{uploadError}</p>
                )}
                {mediaPreview && (
                  <div className="mt-4 relative w-full h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black">
                    {mediaType === "video" ? (
                      <video src={mediaPreview} controls className="w-full h-full object-contain" />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                )}

                {/* AI Creation Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsImageModalOpen(true)}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 font-bold h-11 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-purple-500" /> 🎨 AI Image Creator
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 font-bold h-11 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    <Film className="w-4 h-4 text-purple-500" /> 🎬 AI Video Studio
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end border-t border-slate-100">
              <Button 
                onClick={handleGenerate} 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-2xl font-bold text-lg shadow-md"
              >
                <Bot className="w-5 h-5 mr-2" /> Generate Magic Content
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Loading State */}
        {step === 2 && isGenerating && (
          <div className="h-[400px] flex flex-col items-center justify-center animate-in fade-in">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
              <Bot className="absolute inset-0 m-auto w-10 h-10 text-slate-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">AI is drafting your content...</h2>
            <p className="text-slate-500 font-medium">Analyzing topic and generating {variantCount} variations.</p>
          </div>
        )}

        {/* STEP 3: Review / Selection & Schedule Phase */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <LayoutTemplate className="text-red-600 w-5 h-5" /> ตรวจสอบเนื้อหาและกำหนดเวลาเผยแพร่
                </h3>
                {isFromStudio && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 font-bold px-2.5 py-1 rounded-md border border-purple-200 mt-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> นำเข้าข้อมูลจาก AI Studio เรียบร้อยแล้ว
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                className="border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs rounded-xl"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> ย้อนกลับไปแก้ไข
              </Button>
            </div>

            {/* Target Channels overview in Step 3 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-600 uppercase tracking-wide">
                  ช่องทางที่จะส่งโพสต์ (Target Channels)
                </span>
                <span className="text-xs font-bold text-slate-400">
                  เลือกแล้ว {selectedChannels.length} / {connections.length} ช่องทาง
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {connections.map((c) => {
                  const isChecked = selectedChannels.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleChannel(c.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? "bg-red-600 text-white border-red-600 shadow-xs"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span>{c.platform}: {c.accountName}</span>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If there are AI generated variants, display them */}
            {variants.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-600 uppercase tracking-wide block">
                  เลือกรูปแบบข้อความที่ต้องการ (Options):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {variants.map((variant, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedContent(variant)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedContent === variant 
                          ? 'border-red-600 bg-red-50/70 shadow-md ring-2 ring-red-600/10' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> ตัวเลือกที่ {idx + 1}
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-6">{variant}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Editor + Media Preview Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Caption Textarea */}
              <div className="lg:col-span-7 space-y-2">
                <span className="text-xs font-black text-slate-600 uppercase tracking-wide block">
                  ข้อความแคปชัน (แก้ไขเพิ่มเติมได้โดยตรง):
                </span>
                <Textarea 
                  value={selectedContent}
                  onChange={(e) => setSelectedContent(e.target.value)}
                  className="bg-white border-slate-200 text-slate-800 h-52 resize-none text-sm leading-relaxed focus-visible:ring-red-600 shadow-inner rounded-2xl p-4 font-sans"
                  placeholder="พิมพ์ข้อความแคปชันที่ต้องการโพสต์..."
                />
                <div className="text-[10px] text-slate-400 text-right">
                  จำนวนตัวอักษร: {selectedContent.length} ตัวอักษร
                </div>
              </div>

              {/* Attached Media Box */}
              <div className="lg:col-span-5 space-y-2">
                <span className="text-xs font-black text-slate-600 uppercase tracking-wide block">
                  สื่อประกอบโพสต์ (Attached Media):
                </span>
                {mediaPreview || mediaUrl ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black group">
                    {mediaType === "video" ? (
                      <video src={mediaPreview || mediaUrl!} controls className="w-full h-full object-contain" />
                    ) : (
                      <img src={mediaPreview || mediaUrl!} alt="Media visual" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      {mediaType === "video" ? <Film className="w-3 h-3 text-indigo-400" /> : <ImageIcon className="w-3 h-3 text-purple-400" />}
                      {mediaType === "video" ? "วิดีโอ" : "รูปภาพ"}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center text-slate-400 h-52">
                    <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">ไม่มีไฟล์สื่อแนบ</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">ระบบจะโพสต์เฉพาะข้อความตัวอักษร</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setStep(1)} 
                      className="mt-3 text-[11px] h-8 rounded-lg border-slate-200 text-slate-600"
                    >
                      + แนบรูปภาพ/วิดีโอ
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Schedule & Action Box */}
            <div className="mt-4 p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" /> กำหนดเวลาเผยแพร่ / เผยแพร่ทันที
              </h4>
              <div className="flex flex-col gap-4">
                {/* Date + Time Row */}
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Date Picker */}
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">📆 วันที่</label>
                    <Popover>
                      <PopoverTrigger 
                        className={`w-full justify-start text-left font-semibold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 inline-flex items-center rounded-xl transition-colors h-12 px-4 py-2 ${!date && "text-slate-400"}`}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 text-slate-400" />
                        {date ? format(date, "d MMM yyyy", { locale: th }) : <span>เลือกวันที่</span>}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border-slate-200 text-slate-800 shadow-xl rounded-2xl">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={{ before: new Date() }}
                          className="bg-white text-slate-800 rounded-2xl"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Picker */}
                  <div className="md:w-52">
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">🕐 เวลา</label>
                    <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-xl px-4 h-12">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <select
                        value={scheduleHour}
                        onChange={(e) => setScheduleHour(e.target.value)}
                        className="bg-transparent text-slate-700 font-semibold text-sm focus:outline-none flex-1"
                      >
                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="text-slate-400 font-bold">:</span>
                      <select
                        value={scheduleMinute}
                        onChange={(e) => setScheduleMinute(e.target.value)}
                        className="bg-transparent text-slate-700 font-semibold text-sm focus:outline-none flex-1"
                      >
                        {["00", "15", "30", "45"].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Preview of scheduled time */}
                {date && (
                  <div className="text-xs text-slate-500 bg-white border border-slate-100 rounded-xl px-4 py-2.5">
                    📌 จะโพสต์วันที่ <span className="font-bold text-slate-700">
                      {format(date, "EEEE d MMMM yyyy", { locale: th })}
                    </span> เวลา <span className="font-bold text-red-600">{scheduleHour}:{scheduleMinute} น.</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    disabled={isPublishing}
                    onClick={() => handlePublish(false)}
                    className="flex-1 h-12 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-bold px-6 rounded-xl text-xs sm:text-sm"
                  >
                    {isPublishing ? <RefreshCcw className="w-5 h-5 animate-spin mr-2" /> : <CalendarIcon className="w-5 h-5 mr-2 text-slate-400" />}
                    ตั้งเวลา Auto-Post (Schedule)
                  </Button>
                  <Button 
                    disabled={isPublishing}
                    onClick={() => handlePublish(true)}
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold px-8 rounded-xl shadow-md text-xs sm:text-sm"
                  >
                    {isPublishing ? <RefreshCcw className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                    โพสต์ทันที (Post Now)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Success Phase */}
        {step === 4 && publishSuccess && (
          <div className="h-[400px] flex flex-col items-center justify-center animate-in zoom-in-95">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border-8 border-green-100">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Content Queued! 🎉</h2>
            {scheduledDateTime && (
              <div className="mt-2 mb-4 px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-center">
                <p className="text-slate-400 text-xs">กำหนดโพสต์วันที่</p>
                <p className="font-black text-slate-800 text-base mt-0.5">
                  {format(scheduledDateTime, "EEEE d MMMM yyyy", { locale: th })} เวลา {format(scheduledDateTime, "HH:mm")} น.
                </p>
              </div>
            )}
            <p className="text-slate-500 text-center max-w-md font-medium text-xs">
              โพสต์ถูกบันทึกแล้ว ระบบ Auto-Publisher จะทำการส่งออกตามเวลาที่กำหนดโดยอัตโนมัติ
            </p>
            <div className="mt-8 flex gap-3">
              <Button 
                variant="outline" 
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold px-5 h-12 rounded-xl text-xs" 
                onClick={() => window.location.href='/dashboard/history'}
              >
                📊 ดูประวัติ (Post History)
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 h-12 rounded-xl shadow-md text-xs" 
                onClick={() => {
                  setStep(1);
                  setPublishSuccess(false);
                  setTopic("");
                  setSelectedContent("");
                  setMediaUrl(null);
                  setMediaPreview(null);
                  setScheduledDateTime(null);
                  setIsFromStudio(false);
                }}
              >
                ✨ สร้างโพสต์ใหม่
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* AI Modals */}
      <AIImageCreatorModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelectImage={(url) => {
          setMediaUrl(url);
          setMediaPreview(url);
          setMediaType("image");
        }}
      />

      <AIVideoStudioModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSelectVideo={(url) => {
          setMediaUrl(url);
          setMediaPreview(url);
          setMediaType("video");
        }}
      />

      <AIArticleWriterModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        onUseArticle={(article) => {
          setTopic(article); // Insert generated article directly into post editor topic
        }}
      />

    </div>
  );
}

export function SinglePostWizard(props: any) {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" /></div>}>
      <SinglePostWizardInner {...props} />
    </Suspense>
  );
}
