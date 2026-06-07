"use client";

import React, { useState, useRef } from "react";
import { generateAIPost, createScheduledPost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  CalendarIcon, Sparkles, Send, CheckCircle2, RefreshCcw,
  Upload, X, Clock, LayoutTemplate, ArrowLeft
} from "lucide-react";

type Connection = { id: string; platform: string; accountName: string; isActive: boolean };

const LAYOUT_OPTIONS = [
  { count: 4,  label: "4 รูป",  grid: "grid-cols-2",         desc: "2×2" },
  { count: 6,  label: "6 รูป",  grid: "grid-cols-3",         desc: "2×3" },
  { count: 8,  label: "8 รูป",  grid: "grid-cols-4",         desc: "2×4" },
  { count: 10, label: "10 รูป", grid: "grid-cols-5",         desc: "2×5" },
];

const LANGUAGES = ["Thai","English","Japanese","Chinese","Korean","French","German","Spanish","Arabic","Vietnamese","Indonesian"];

type ImageSlot = { file: File | null; preview: string | null; url: string | null; uploading: boolean; error: string };

function emptySlot(): ImageSlot {
  return { file: null, preview: null, url: null, uploading: false, error: "" };
}

export function MultiImageWizard({
  connections,
  onBack,
}: {
  connections: Connection[];
  onBack: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("Thai");
  const [layoutCount, setLayoutCount] = useState(4);
  const [slots, setSlots] = useState<ImageSlot[]>(Array.from({ length: 4 }, emptySlot));

  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState("");

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [scheduleHour, setScheduleHour] = useState(String(new Date().getHours()).padStart(2, "0"));
  const [scheduleMinute, setScheduleMinute] = useState("00");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Change layout → resize slots array
  const handleLayoutChange = (count: number) => {
    setLayoutCount(count);
    setSlots(prev => {
      const next = Array.from({ length: count }, (_, i) => prev[i] || emptySlot());
      return next;
    });
  };

  const toggleChannel = (id: string) =>
    setSelectedChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  // Upload a single image slot
  const handleFileSelect = async (index: number, file: File) => {
    const preview = URL.createObjectURL(file);
    setSlots(prev => {
      const next = [...prev];
      next[index] = { ...next[index], file, preview, uploading: true, error: "" };
      return next;
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      setSlots(prev => {
        const next = [...prev];
        next[index] = { ...next[index], url: data.url, uploading: false };
        return next;
      });
    } catch (e: any) {
      setSlots(prev => {
        const next = [...prev];
        next[index] = { ...next[index], uploading: false, error: e.message };
        return next;
      });
    }
  };

  const clearSlot = (index: number) => {
    setSlots(prev => {
      const next = [...prev];
      if (next[index].preview) URL.revokeObjectURL(next[index].preview!);
      next[index] = emptySlot();
      return next;
    });
  };

  const allSlotsReady = slots.every(s => s.url !== null);
  const anySlotsUploading = slots.some(s => s.uploading);

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("กรุณาใส่ Topic"); return; }
    if (selectedChannels.length === 0) { setError("กรุณาเลือก Channel อย่างน้อย 1 ช่อง"); return; }
    setError(""); setIsGenerating(true);
    const res = await generateAIPost(topic, 3, language);
    setIsGenerating(false);
    if (res.success && res.variants.length > 0) {
      setVariants(res.variants);
      setStep(2);
    } else {
      setError(res.error || "Failed to generate");
    }
  };

  const handlePublish = async (isPostNow: boolean) => {
    if (!selectedContent.trim()) return;
    if (!allSlotsReady) { setError("กรุณาอัปโหลดรูปให้ครบทุก slot ก่อน"); return; }
    setError(""); setIsPublishing(true);

    let publishDate: Date;
    if (isPostNow) {
      publishDate = new Date();
    } else {
      publishDate = date ? new Date(date) : new Date();
      publishDate.setHours(parseInt(scheduleHour), parseInt(scheduleMinute), 0, 0);
    }

    const imageUrls = slots.map(s => s.url!);
    const res = await createScheduledPost({
      content: selectedContent,
      scheduledTime: isPostNow ? null : publishDate,
      targetConnectionIds: selectedChannels,
      imageUrls,
    });

    setIsPublishing(false);
    if (res.success) {
      setPublishSuccess(true);
      setScheduledDateTime(publishDate);
      setStep(3);
    } else {
      setError(res.error || "Failed to schedule post.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h2 className="font-bold text-slate-800 flex items-center gap-2">🖼️ Multi-Photo Post</h2>
          <p className="text-xs text-slate-500">โพสต์แบบ Album {layoutCount} รูป</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${step >= s ? "bg-blue-500" : "bg-slate-200"}`} />
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ─── STEP 1: Setup ─── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            {/* Layout Selector */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-3 block">📐 เลือกจำนวนรูป</label>
              <div className="grid grid-cols-4 gap-3">
                {LAYOUT_OPTIONS.map(opt => (
                  <button
                    key={opt.count}
                    onClick={() => handleLayoutChange(opt.count)}
                    className={`py-3 rounded-xl border-2 text-center transition-all ${
                      layoutCount === opt.count
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xl font-bold">{opt.count}</div>
                    <div className="text-xs mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Slots */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-3 block">
                🖼️ อัปโหลดรูปภาพ ({slots.filter(s => s.url).length}/{layoutCount} รูป)
              </label>
              <div className={`grid gap-3 ${layoutCount <= 4 ? "grid-cols-2 md:grid-cols-4" : layoutCount <= 6 ? "grid-cols-3 md:grid-cols-6" : "grid-cols-4 md:grid-cols-5"}`}>
                {slots.map((slot, idx) => (
                  <div key={idx} className="aspect-square relative group">
                    {slot.preview ? (
                      <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-blue-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slot.preview} alt={`slot-${idx}`} className="w-full h-full object-cover" />
                        {slot.uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <RefreshCcw className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                        {slot.url && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {slot.error && (
                          <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                            <p className="text-white text-xs text-center px-2">{slot.error}</p>
                          </div>
                        )}
                        <button
                          onClick={() => clearSlot(idx)}
                          className="absolute bottom-1 right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center hidden group-hover:flex"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileRefs.current[idx]?.click()}
                        className="w-full h-full rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-1 transition-all"
                      >
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-xs text-slate-400">{idx + 1}</span>
                      </button>
                    )}
                    <input
                      ref={el => { fileRefs.current[idx] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(idx, f); }}
                    />
                  </div>
                ))}
              </div>
              {!allSlotsReady && (
                <p className="text-xs text-amber-600 mt-2">⚠️ ต้องอัปโหลดรูปให้ครบ {layoutCount} slot ก่อนโพสต์</p>
              )}
            </div>

            {/* Channel Selector */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-3 block">📡 เลือก Channel</label>
              <div className="flex flex-wrap gap-2">
                {connections.filter(c => c.isActive).map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggleChannel(c.id)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedChannels.includes(c.id)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {c.platform === "FACEBOOK" ? "📘" : "📷"} {c.accountName}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic + Language */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-slate-700 mb-2 block">✏️ Topic / หัวข้อ</label>
                <Textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="เช่น: อาหารไทยแบบครบ 4 ช่วงเวลา"
                  className="h-20 resize-none border-slate-200 text-slate-800"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">🌐 ภาษา</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full h-20 border border-slate-200 rounded-xl px-3 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || anySlotsUploading || !topic.trim() || selectedChannels.length === 0}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
            >
              {isGenerating
                ? <><RefreshCcw className="w-5 h-5 animate-spin mr-2" /> กำลัง Generate...</>
                : <><Sparkles className="w-5 h-5 mr-2" /> Generate AI Content</>
              }
            </Button>
          </div>
        )}

        {/* ─── STEP 2: Variant Selection + Publish ─── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-blue-600" /> เลือก Variant ที่ชอบ
              </h3>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>ย้อนกลับ</Button>
            </div>

            {/* Image Preview Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {slots.map((slot, i) => (
                <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                  {slot.preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slot.preview} alt={`img-${i}`} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
              <div className="w-16 h-16 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 shrink-0">
                {layoutCount} รูป
              </div>
            </div>

            {/* Variant Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {variants.map((v, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedContent(v)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedContent === v
                      ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Option {i + 1}
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{v}</p>
                </div>
              ))}
            </div>

            {selectedContent && (
              <div className="space-y-4 animate-in fade-in">
                <Textarea
                  value={selectedContent}
                  onChange={e => setSelectedContent(e.target.value)}
                  className="h-32 resize-none border-slate-200 text-slate-800"
                />

                {/* Scheduling */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">📅 กำหนดเวลาเผยแพร่</h4>
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">📆 วันที่</label>
                      <Popover>
                        <PopoverTrigger className={`w-full justify-start text-left font-semibold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center rounded-xl h-11 px-4 ${!date && "text-slate-400"}`}>
                          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                          {date ? format(date, "d MMM yyyy", { locale: th }) : "เลือกวันที่"}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white shadow-xl rounded-xl">
                          <Calendar mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date() }} className="bg-white rounded-xl" />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="md:w-48">
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">🕐 เวลา</label>
                      <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-xl px-3 h-11">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <select value={scheduleHour} onChange={e => setScheduleHour(e.target.value)} className="bg-transparent text-slate-700 font-semibold text-sm focus:outline-none flex-1">
                          {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="text-slate-400 font-bold">:</span>
                        <select value={scheduleMinute} onChange={e => setScheduleMinute(e.target.value)} className="bg-transparent text-slate-700 font-semibold text-sm focus:outline-none flex-1">
                          {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {date && (
                    <div className="text-xs text-slate-500 bg-white border border-slate-100 rounded-lg px-3 py-2">
                      📌 จะโพสต์วันที่ <span className="font-bold text-slate-700">{format(date, "EEEE d MMMM yyyy", { locale: th })}</span> เวลา <span className="font-bold text-blue-600">{scheduleHour}:{scheduleMinute} น.</span>
                    </div>
                  )}

                  {!allSlotsReady && (
                    <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      ⚠️ รูปบางรูปยังอัปโหลดไม่สำเร็จ กรุณาย้อนกลับและลองใหม่
                    </div>
                  )}

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <div className="flex gap-3">
                    <Button
                      disabled={isPublishing || !allSlotsReady}
                      onClick={() => handlePublish(false)}
                      className="flex-1 h-11 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl"
                    >
                      {isPublishing ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />}
                      Schedule
                    </Button>
                    <Button
                      disabled={isPublishing || !allSlotsReady}
                      onClick={() => handlePublish(true)}
                      className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                    >
                      {isPublishing ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      Post Now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 3: Success ─── */}
        {step === 3 && publishSuccess && (
          <div className="flex flex-col items-center justify-center py-16 animate-in zoom-in-95">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 border-8 border-blue-100">
              <CheckCircle2 className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Album Queued! 🎉</h2>
            <p className="text-slate-500 text-sm mb-4">{layoutCount} รูปถูกบันทึกแล้ว</p>
            {scheduledDateTime && (
              <div className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center mb-6">
                <p className="text-slate-500">กำหนดโพสต์วันที่</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {format(scheduledDateTime, "EEEE d MMMM yyyy", { locale: th })} เวลา {format(scheduledDateTime, "HH:mm")} น.
                </p>
              </div>
            )}
            {/* Image Preview */}
            <div className="flex gap-2 mb-8">
              {slots.slice(0, 5).map((s, i) => (
                <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.preview && <img src={s.preview} alt="" className="w-full h-full object-cover" />}
                </div>
              ))}
              {layoutCount > 5 && <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">+{layoutCount - 5}</div>}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="font-bold px-6 rounded-xl" onClick={() => window.location.href = "/dashboard/history"}>
                View History
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl" onClick={() => {
                setStep(1); setPublishSuccess(false); setTopic(""); setSelectedContent("");
                setVariants([]); setScheduledDateTime(null);
                setSlots(Array.from({ length: layoutCount }, emptySlot));
              }}>
                สร้าง Album ใหม่
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
