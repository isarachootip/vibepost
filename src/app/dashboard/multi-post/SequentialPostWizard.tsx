"use client";

import React, { useState, useRef, useCallback } from "react";
import { generateAIPost, createScheduledPost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addMinutes } from "date-fns";
import { th } from "date-fns/locale";
import {
  CalendarIcon, Sparkles, Send, CheckCircle2, RefreshCcw,
  Upload, X, Clock, ArrowLeft, GripVertical, Plus, PenTool,
  AlertCircle, List
} from "lucide-react";
import { AIImageCreatorModal } from "./AIImageCreatorModal";
import { AIArticleWriterModal } from "./AIArticleWriterModal";

type Connection = { id: string; platform: string; accountName: string; isActive: boolean };

type ImageSlot = {
  id: string;
  file: File | null;
  preview: string | null;
  url: string | null;
  uploading: boolean;
  error: string;
  caption: string; // per-post caption
};

const INTERVAL_OPTIONS = [
  { label: "โพสต์พร้อมกัน", minutes: 0 },
  { label: "ห่าง 30 นาที", minutes: 30 },
  { label: "ห่าง 1 ชั่วโมง", minutes: 60 },
  { label: "ห่าง 2 ชั่วโมง", minutes: 120 },
  { label: "ห่าง 6 ชั่วโมง", minutes: 360 },
  { label: "ห่าง 12 ชั่วโมง", minutes: 720 },
  { label: "ห่าง 1 วัน", minutes: 1440 },
];

const LANGUAGES = ["Thai", "English", "Japanese", "Chinese", "Korean", "French", "German", "Spanish"];

let slotCounter = 0;
function makeSlot(): ImageSlot {
  return {
    id: `slot-${++slotCounter}`,
    file: null,
    preview: null,
    url: null,
    uploading: false,
    error: "",
    caption: "",
  };
}

export function SequentialPostWizard({
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
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [slots, setSlots] = useState<ImageSlot[]>([makeSlot(), makeSlot()]);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  // Modals
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  // Step 2 state
  const [isGenerating, setIsGenerating] = useState(false);
  const [sharedCaption, setSharedCaption] = useState("");
  const [captionMode, setCaptionMode] = useState<"shared" | "individual">("shared");

  // Schedule
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [scheduleHour, setScheduleHour] = useState(String(new Date().getHours()).padStart(2, "0"));
  const [scheduleMinute, setScheduleMinute] = useState("00");

  // Publish
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<{ success: boolean; error?: string }[]>([]);
  const [publishDone, setPublishDone] = useState(false);
  const [error, setError] = useState("");

  // Drop zone
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Upload ───
  const uploadFile = useCallback(async (slot: ImageSlot, file: File): Promise<ImageSlot> => {
    const preview = URL.createObjectURL(file);
    const updating: ImageSlot = { ...slot, file, preview, uploading: true, error: "" };

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      return { ...updating, url: data.url, uploading: false };
    } catch (e: any) {
      return { ...updating, uploading: false, error: e.message };
    }
  }, []);

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

  // ─── Drop Zone (multiple files) ───
  const handleDropZone = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (!files.length) return;

    // Add new slots for extra files beyond existing empty slots
    setSlots(prev => {
      const emptyCount = prev.filter(s => !s.file).length;
      const extra = Math.max(0, files.length - emptyCount);
      const newSlots = [...prev, ...Array.from({ length: extra }, makeSlot)];
      return newSlots.slice(0, 10);
    });

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setSlots(prev => {
        const emptyIdx = prev.findIndex(s => !s.file);
        if (emptyIdx < 0) return prev;
        const next = [...prev];
        next[emptyIdx] = { ...next[emptyIdx], file, preview: URL.createObjectURL(file), uploading: true, error: "" };
        return next;
      });

      // Upload async
      (async () => {
        try {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
          setSlots(prev => {
            const idx = prev.findIndex(s => s.file === file);
            if (idx < 0) return prev;
            const next = [...prev];
            next[idx] = { ...next[idx], url: data.url, uploading: false };
            return next;
          });
        } catch (e: any) {
          setSlots(prev => {
            const idx = prev.findIndex(s => s.file === file);
            if (idx < 0) return prev;
            const next = [...prev];
            next[idx] = { ...next[idx], uploading: false, error: e.message };
            return next;
          });
        }
      })();
    }
  };

  // ─── Drag to Reorder ───
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndex.current = index;
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    setSlots(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex.current!, 1);
      next.splice(index, 0, moved);
      return next;
    });
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  const clearSlot = (index: number) => {
    setSlots(prev => {
      const next = [...prev];
      if (next[index].preview) URL.revokeObjectURL(next[index].preview!);
      next[index] = { ...makeSlot(), id: next[index].id };
      return next;
    });
  };

  const removeSlot = (index: number) => {
    if (slots.length <= 1) return;
    setSlots(prev => {
      const next = [...prev];
      if (next[index].preview) URL.revokeObjectURL(next[index].preview!);
      next.splice(index, 1);
      return next;
    });
  };

  const addSlot = () => {
    if (slots.length >= 10) return;
    setSlots(prev => [...prev, makeSlot()]);
  };

  const toggleChannel = (id: string) =>
    setSelectedChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const uploadedSlots = slots.filter(s => s.url !== null);
  const allUploaded = slots.every(s => s.url !== null || (!s.file && !s.preview));
  const filledSlots = slots.filter(s => s.url !== null);

  // ─── Generate Captions ───
  const handleGenerate = async () => {
    if (selectedChannels.length === 0) { setError("กรุณาเลือก Channel อย่างน้อย 1 ช่อง"); return; }
    if (filledSlots.length === 0) { setError("กรุณาอัปโหลดรูปอย่างน้อย 1 รูป"); return; }
    if (!topic.trim()) { setError("กรุณาใส่ Topic"); return; }

    setError("");
    setIsGenerating(true);
    const res = await generateAIPost(topic, 1, language);
    setIsGenerating(false);

    if (res.success && res.variants.length > 0) {
      const caption = res.variants[0];
      setSharedCaption(caption);
      setSlots(prev => prev.map(s => ({ ...s, caption })));
      setStep(2);
    } else {
      setError(res.error || "Failed to generate");
    }
  };

  // ─── Publish ───
  const getPostTime = (index: number, baseDate: Date): Date => {
    return addMinutes(baseDate, index * intervalMinutes);
  };

  const handlePublish = async (isPostNow: boolean) => {
    if (filledSlots.length === 0) return;
    setError("");
    setIsPublishing(true);

    let baseDate: Date;
    if (isPostNow) {
      baseDate = new Date();
    } else {
      baseDate = startDate ? new Date(startDate) : new Date();
      baseDate.setHours(parseInt(scheduleHour), parseInt(scheduleMinute), 0, 0);
    }

    const results: { success: boolean; error?: string }[] = [];

    for (let i = 0; i < filledSlots.length; i++) {
      const slot = filledSlots[i];
      const postTime = getPostTime(i, baseDate);
      const caption = captionMode === "individual" ? (slot.caption || sharedCaption) : sharedCaption;

      const res = await createScheduledPost({
        content: caption,
        scheduledTime: isPostNow && intervalMinutes === 0 ? null : postTime,
        targetConnectionIds: selectedChannels,
        imageUrls: slot.url ? [slot.url] : [],
      });

      results.push(res.success ? { success: true } : { success: false, error: res.error });
    }

    setPublishResults(results);
    setIsPublishing(false);
    setPublishDone(true);
    setStep(3);
  };

  const allSucceeded = publishResults.every(r => r.success);
  const anyFailed = publishResults.some(r => !r.success);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-amber-50">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/60 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <List className="w-4 h-4 text-orange-500" />
            Sequential Posts
          </h2>
          <p className="text-xs text-slate-500">แต่ละรูปเป็น Post แยก — เรียงลำดับ {filledSlots.length} Post</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${step >= s ? "bg-orange-500" : "bg-slate-200"}`} />
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ─── STEP 1: Setup ─── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDropZone}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isDragOver
                  ? "border-orange-400 bg-orange-50"
                  : "border-slate-200 hover:border-orange-300 hover:bg-orange-50/30"
              }`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? "text-orange-500" : "text-slate-400"}`} />
              <p className="text-sm font-bold text-slate-600">ลากรูปหลายรูปมาวางที่นี่</p>
              <p className="text-xs text-slate-400 mt-1">หรือใช้ปุ่ม อัปโหลด ด้านล่าง (สูงสุด 10 รูป)</p>
            </div>

            {/* Image Slots with Drag to Reorder */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-slate-700">
                  🖼️ รูปที่จะโพสต์ ({filledSlots.length} รูป → {filledSlots.length} Posts)
                </label>
                {slots.length < 10 && (
                  <button
                    onClick={addSlot}
                    className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus className="w-3 h-3" /> เพิ่มรูป
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {slots.map((slot, idx) => (
                  <div
                    key={slot.id}
                    draggable
                    onDragStart={e => handleDragStart(e, idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDrop={e => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 group hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-default"
                  >
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 shrink-0">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Order Number */}
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>

                    {/* Image Preview / Upload */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 relative">
                      {slot.preview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={slot.preview} alt={`post-${idx + 1}`} className="w-full h-full object-cover" />
                          {slot.uploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <RefreshCcw className="w-4 h-4 text-white animate-spin" />
                            </div>
                          )}
                          {slot.url && (
                            <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <Upload className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Info + buttons */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-600">Post {idx + 1}</div>
                      {slot.error && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3" /> {slot.error}
                        </p>
                      )}
                      {slot.url && intervalMinutes > 0 && startDate && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          🕐 {format(
                            addMinutes(
                              (() => {
                                const d = new Date(startDate);
                                d.setHours(parseInt(scheduleHour), parseInt(scheduleMinute), 0, 0);
                                return d;
                              })(),
                              idx * intervalMinutes
                            ),
                            "d MMM HH:mm",
                            { locale: th }
                          )} น.
                        </p>
                      )}
                    </div>

                    {/* Upload Buttons */}
                    <div className="flex gap-1.5 shrink-0">
                      {!slot.preview && (
                        <>
                          <button
                            onClick={() => fileRefs.current[idx]?.click()}
                            className="text-[10px] font-bold bg-white border border-slate-200 hover:border-slate-300 text-slate-600 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <Upload className="w-3 h-3" /> อัปโหลด
                          </button>
                          <button
                            onClick={() => { setActiveSlotIndex(idx); setIsImageModalOpen(true); }}
                            className="text-[10px] font-bold bg-purple-50 border border-purple-200 hover:border-purple-300 text-purple-700 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <Sparkles className="w-3 h-3 animate-pulse" /> AI
                          </button>
                        </>
                      )}
                      {slot.preview && !slot.uploading && (
                        <button
                          onClick={() => clearSlot(idx)}
                          className="text-[10px] font-bold bg-white border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <RefreshCcw className="w-3 h-3" /> เปลี่ยน
                        </button>
                      )}
                      {slots.length > 1 && (
                        <button
                          onClick={() => removeSlot(idx)}
                          className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

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

              {filledSlots.length > 0 && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                  <p className="text-xs font-bold text-orange-700 flex items-center gap-1">
                    📋 จะสร้าง <span className="text-orange-600 underline">{filledSlots.length} Posts</span> แยกกัน ใน Facebook Timeline
                  </p>
                </div>
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
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {c.platform === "FACEBOOK" ? "📘" : "📷"} {c.accountName}
                  </button>
                ))}
              </div>
            </div>

            {/* Interval Picker */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-3 block">⏱️ ระยะห่างระหว่าง Posts</label>
              <div className="grid grid-cols-4 gap-2">
                {INTERVAL_OPTIONS.map(opt => (
                  <button
                    key={opt.minutes}
                    onClick={() => setIntervalMinutes(opt.minutes)}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-bold text-center transition-all ${
                      intervalMinutes === opt.minutes
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Time */}
            {intervalMinutes > 0 && (
              <div>
                <label className="text-sm font-bold text-slate-700 mb-3 block">📅 เวลาเริ่มโพสต์แรก</label>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger className={`w-full justify-start text-left font-semibold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center rounded-xl h-11 px-4 ${!startDate && "text-slate-400"}`}>
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                        {startDate ? format(startDate, "d MMM yyyy", { locale: th }) : "เลือกวันที่"}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white shadow-xl rounded-xl">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={{ before: new Date() }} className="bg-white rounded-xl" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="md:w-48">
                    <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-xl px-3 h-11">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <select value={scheduleHour} onChange={e => setScheduleHour(e.target.value)} className="bg-transparent text-slate-700 font-semibold text-sm focus:outline-none flex-1">
                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="text-slate-400 font-bold">:</span>
                      <select value={scheduleMinute} onChange={e => setScheduleMinute(e.target.value)} className="bg-transparent text-slate-700 font-semibold text-sm focus:outline-none flex-1">
                        {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Topic + Language */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-700">✏️ Topic / Caption</label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsArticleModalOpen(true)}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 text-[10px] font-black flex items-center gap-1 py-1 h-6 rounded-lg"
                  >
                    <PenTool className="w-3 h-3" /> AI Article Writer
                  </Button>
                </div>
                <Textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="เช่น: โปรโมชั่น Solar Rooftop ลด 10% เดือนกรกฎาคม"
                  className="h-20 resize-none border-slate-200 text-slate-800"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">🌐 ภาษา</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full h-20 border border-slate-200 rounded-xl px-3 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || filledSlots.length === 0 || !topic.trim() || selectedChannels.length === 0}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl"
            >
              {isGenerating
                ? <><RefreshCcw className="w-5 h-5 animate-spin mr-2" /> กำลัง Generate...</>
                : <><Sparkles className="w-5 h-5 mr-2" /> Generate AI Caption</>
              }
            </Button>
          </div>
        )}

        {/* ─── STEP 2: Caption + Schedule ─── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <List className="w-5 h-5 text-orange-500" /> ตรวจสอบ Caption + กำหนดเวลา
              </h3>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>ย้อนกลับ</Button>
            </div>

            {/* Caption Mode */}
            <div className="flex gap-3">
              <button
                onClick={() => setCaptionMode("shared")}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${captionMode === "shared" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-600"}`}
              >
                📝 Caption เดียวกันทุก Post
              </button>
              <button
                onClick={() => setCaptionMode("individual")}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${captionMode === "individual" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-600"}`}
              >
                ✍️ Caption แยกต่างหากแต่ละ Post
              </button>
            </div>

            {captionMode === "shared" ? (
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">Caption สำหรับทุก Post</label>
                <Textarea
                  value={sharedCaption}
                  onChange={e => setSharedCaption(e.target.value)}
                  className="h-32 resize-none border-slate-200 text-slate-800"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {filledSlots.map((slot, idx) => (
                  <div key={slot.id} className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {slot.preview && <img src={slot.preview} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Post {idx + 1}</label>
                      <Textarea
                        value={slot.caption || sharedCaption}
                        onChange={e => {
                          const val = e.target.value;
                          setSlots(prev => {
                            const next = [...prev];
                            const realIdx = prev.findIndex(s => s.id === slot.id);
                            if (realIdx >= 0) next[realIdx] = { ...next[realIdx], caption: val };
                            return next;
                          });
                        }}
                        className="h-20 resize-none border-slate-200 text-slate-800 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline Preview */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <h4 className="font-bold text-slate-800 text-sm mb-3">📅 Timeline การโพสต์</h4>
              <div className="space-y-2">
                {filledSlots.map((slot, idx) => {
                  const postTime = (() => {
                    if (intervalMinutes === 0) return null;
                    const d = startDate ? new Date(startDate) : new Date();
                    d.setHours(parseInt(scheduleHour), parseInt(scheduleMinute), 0, 0);
                    return addMinutes(d, idx * intervalMinutes);
                  })();
                  return (
                    <div key={slot.id} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {slot.preview && <img src={slot.preview} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700">Post {idx + 1}</p>
                        <p className="text-xs text-slate-500">
                          {postTime
                            ? format(postTime, "EEEE d MMM yyyy HH:mm", { locale: th }) + " น."
                            : "โพสต์ทันที"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3">
              <Button
                disabled={isPublishing}
                onClick={() => handlePublish(false)}
                className="flex-1 h-11 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl"
              >
                {isPublishing ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />}
                Schedule
              </Button>
              <Button
                disabled={isPublishing}
                onClick={() => handlePublish(true)}
                className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl"
              >
                {isPublishing ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Post Now
              </Button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Result ─── */}
        {step === 3 && publishDone && (
          <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 border-8 ${allSucceeded ? "bg-green-50 border-green-100" : anyFailed && !allSucceeded ? "bg-amber-50 border-amber-100" : "bg-green-50 border-green-100"}`}>
              <CheckCircle2 className={`w-10 h-10 ${allSucceeded ? "text-green-500" : "text-amber-500"}`} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {allSucceeded ? "Posts Queued! 🎉" : "บางส่วนสำเร็จ ⚠️"}
            </h2>

            <div className="w-full space-y-2 mb-8">
              {publishResults.map((r, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${r.success ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${r.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {i + 1}
                  </div>
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {filledSlots[i]?.preview && <img src={filledSlots[i].preview!} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700">Post {i + 1}</p>
                    {!r.success && <p className="text-xs text-red-500">{r.error}</p>}
                  </div>
                  {r.success
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <AlertCircle className="w-4 h-4 text-red-500" />
                  }
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="font-bold px-6 rounded-xl" onClick={() => window.location.href = "/dashboard/history"}>
                View History
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 rounded-xl"
                onClick={() => {
                  setStep(1);
                  setPublishDone(false);
                  setPublishResults([]);
                  setTopic("");
                  setSharedCaption("");
                  setSlots([makeSlot(), makeSlot()]);
                }}
              >
                สร้าง Sequential ใหม่
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* AI Modals */}
      <AIImageCreatorModal
        isOpen={isImageModalOpen}
        onClose={() => { setIsImageModalOpen(false); setActiveSlotIndex(null); }}
        onSelectImage={(url) => {
          if (activeSlotIndex !== null) {
            setSlots(prev => {
              const next = [...prev];
              next[activeSlotIndex] = { ...next[activeSlotIndex], file: null, preview: url, url, uploading: false, error: "" };
              return next;
            });
          }
        }}
      />

      <AIArticleWriterModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        onUseArticle={(article) => setTopic(article)}
      />
    </div>
  );
}
