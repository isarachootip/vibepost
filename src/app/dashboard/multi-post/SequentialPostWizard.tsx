"use client";

import React, { useState, useRef } from "react";
import { generateAIPost, createScheduledPost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format, addMinutes } from "date-fns";
import { th } from "date-fns/locale";
import {
  CalendarIcon, Sparkles, Send, CheckCircle2, RefreshCcw,
  Upload, X, ArrowLeft, GripVertical, Plus, PenTool,
  AlertCircle, List
} from "lucide-react";
import { useFutureSchedule } from "@/hooks/use-future-schedule";
import { ScheduleDateTimePicker } from "@/components/scheduling/ScheduleDateTimePicker";
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
  const schedule = useFutureSchedule();

  // Publish
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<{ success: boolean; error?: string }[]>([]);
  const [publishDone, setPublishDone] = useState(false);
  const [error, setError] = useState("");

  // Drop zone
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Upload ───
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setSlots(prev => {
        const next = [...prev];
        next[index] = { ...next[index], uploading: false, error: msg };
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
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Upload failed";
          setSlots(prev => {
            const idx = prev.findIndex(s => s.file === file);
            if (idx < 0) return prev;
            const next = [...prev];
            next[idx] = { ...next[idx], uploading: false, error: msg };
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

    const baseDate = isPostNow ? new Date() : schedule.getScheduledDate();

    const results: { success: boolean; error?: string }[] = [];

    for (let i = 0; i < filledSlots.length; i++) {
      const slot = filledSlots[i];
      const isImmediateSlot = isPostNow && (intervalMinutes === 0 || i === 0);
      const postTime = getPostTime(i, baseDate);
      const caption = captionMode === "individual" ? (slot.caption || sharedCaption) : sharedCaption;

      const res = await createScheduledPost({
        content: caption,
        scheduledTime: isImmediateSlot ? null : postTime,
        publishMode: isImmediateSlot ? "NOW" : "SCHEDULE",
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
    <div className="neu-raised neu-grain rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/60 bg-[var(--surface-recessed)]/70">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl neu-pressed text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-display font-bold text-foreground flex items-center gap-2">
            <List className="w-4 h-4 text-amber-500" />
            Sequential Posts
          </h2>
          <p className="text-xs text-muted-foreground">แต่ละรูปเป็น Post แยก — เรียงลำดับ {filledSlots.length} Post</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${step >= s ? "bg-amber-500" : "bg-border/70"}`} />
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
                  ? "border-amber-500/60 bg-amber-500/10"
                  : "border-border/70 neu-pressed hover:border-amber-500/40"
              }`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? "text-amber-500" : "text-muted-foreground"}`} />
              <p className="text-sm font-bold text-foreground/85">ลากรูปหลายรูปมาวางที่นี่</p>
              <p className="text-xs text-muted-foreground mt-1">หรือใช้ปุ่ม อัปโหลด ด้านล่าง (สูงสุด 10 รูป)</p>
            </div>

            {/* Image Slots with Drag to Reorder */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-foreground">
                  🖼️ รูปที่จะโพสต์ ({filledSlots.length} รูป → {filledSlots.length} Posts)
                </label>
                {slots.length < 10 && (
                  <button
                    type="button"
                    onClick={addSlot}
                    className="flex items-center gap-1 text-xs font-bold bg-amber-500/12 text-amber-600 dark:text-amber-300 border border-amber-500/25 hover:brightness-110 px-3 py-1.5 rounded-lg transition-all"
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
                    className="flex items-center gap-3 p-3 neu-pressed rounded-xl border border-border/60 group hover:border-amber-500/35 transition-all cursor-default"
                  >
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground shrink-0">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Order Number */}
                    <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/25 text-xs font-extrabold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>

                    {/* Image Preview / Upload */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-border/60 shrink-0 relative bg-[var(--surface-recessed)]">
                      {slot.preview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={slot.preview} alt={`post-${idx + 1}`} className="w-full h-full object-cover" />
                          {slot.uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <RefreshCcw className="w-4 h-4 text-white animate-spin" />
                            </div>
                          )}
                          {slot.url && (
                            <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Upload className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info + buttons */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground">Post {idx + 1}</div>
                      {slot.error && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3" /> {slot.error}
                        </p>
                      )}
                      {slot.url && intervalMinutes > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                          🕐 {format(
                            addMinutes(schedule.getScheduledDate(), idx * intervalMinutes),
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
                            type="button"
                            onClick={() => fileRefs.current[idx]?.click()}
                            className="text-[10px] font-bold bg-[var(--surface-elevated)] border border-border/70 hover:border-border text-foreground/85 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <Upload className="w-3 h-3" /> อัปโหลด
                          </button>
                          <button
                            type="button"
                            onClick={() => { setActiveSlotIndex(idx); setIsImageModalOpen(true); }}
                            className="text-[10px] font-bold neu-tint-primary px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <Sparkles className="w-3 h-3 animate-pulse" /> AI
                          </button>
                        </>
                      )}
                      {slot.preview && !slot.uploading && (
                        <button
                          type="button"
                          onClick={() => clearSlot(idx)}
                          className="text-[10px] font-bold bg-[var(--surface-elevated)] border border-border/70 hover:border-destructive/40 text-muted-foreground hover:text-destructive px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <RefreshCcw className="w-3 h-3" /> เปลี่ยน
                        </button>
                      )}
                      {slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSlot(idx)}
                          className="w-6 h-6 rounded-lg bg-destructive/12 hover:bg-destructive/20 flex items-center justify-center text-destructive transition-all"
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
                <div className="mt-3 p-3 bg-amber-500/12 border border-amber-500/25 rounded-xl">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    📋 จะสร้าง <span className="underline">{filledSlots.length} Posts</span> แยกกัน ใน Facebook Timeline
                  </p>
                </div>
              )}
            </div>

            {/* Channel Selector */}
            <div>
              <label className="text-sm font-bold text-foreground mb-3 block">📡 เลือก Channel</label>
              <div className="flex flex-wrap gap-2">
                {connections.filter(c => c.isActive).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleChannel(c.id)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      selectedChannels.includes(c.id)
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
                        : "neu-pressed border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.platform === "FACEBOOK" ? "📘" : "📷"} {c.accountName}
                  </button>
                ))}
              </div>
            </div>

            {/* Interval Picker */}
            <div>
              <label className="text-sm font-bold text-foreground mb-3 block">⏱️ ระยะห่างระหว่าง Posts</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {INTERVAL_OPTIONS.map(opt => (
                  <button
                    key={opt.minutes}
                    type="button"
                    onClick={() => setIntervalMinutes(opt.minutes)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      intervalMinutes === opt.minutes
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
                        : "neu-pressed border-border/60 text-muted-foreground hover:text-foreground"
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
                <label className="text-sm font-bold text-foreground mb-3 block">📅 เวลาเริ่มโพสต์แรก</label>
                <ScheduleDateTimePicker
                  schedule={schedule}
                  accentColor="orange"
                  showLabels={false}
                  showPreview={false}
                />
              </div>
            )}

            {/* Topic + Language */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-foreground">✏️ Topic / Caption</label>
                  <Button
                    type="button"
                    variant="neu"
                    onClick={() => setIsArticleModalOpen(true)}
                    className="text-primary text-[10px] font-bold flex items-center gap-1 py-1 h-7 rounded-lg"
                  >
                    <PenTool className="w-3 h-3" /> AI Article Writer
                  </Button>
                </div>
                <Textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="เช่น: โปรโมชั่น Solar Rooftop ลด 10% เดือนกรกฎาคม"
                  className="h-20 resize-none rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground mb-2 block">🌐 ภาษา</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full h-20 neu-pressed bg-[var(--surface-recessed)] border border-border/60 rounded-xl px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 [&>option]:bg-[var(--surface-elevated)] [&>option]:text-foreground"
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="text-destructive text-sm bg-destructive/12 border border-destructive/30 rounded-xl px-4 py-3">{error}</p>}

            <Button
              variant="tactile"
              onClick={handleGenerate}
              disabled={isGenerating || filledSlots.length === 0 || !topic.trim() || selectedChannels.length === 0}
              className="w-full h-12 font-bold rounded-xl"
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
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <List className="w-5 h-5 text-amber-500" /> ตรวจสอบ Caption + กำหนดเวลา
              </h3>
              <Button variant="neu" size="sm" onClick={() => setStep(1)}>ย้อนกลับ</Button>
            </div>

            {/* Caption Mode */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCaptionMode("shared")}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  captionMode === "shared"
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
                    : "neu-pressed border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                📝 Caption เดียวกันทุก Post
              </button>
              <button
                type="button"
                onClick={() => setCaptionMode("individual")}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  captionMode === "individual"
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
                    : "neu-pressed border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                ✍️ Caption แยกต่างหากแต่ละ Post
              </button>
            </div>

            {captionMode === "shared" ? (
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wide">
                  Caption สำหรับทุก Post
                </label>
                <Textarea
                  value={sharedCaption}
                  onChange={e => setSharedCaption(e.target.value)}
                  className="h-32 resize-none rounded-xl"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {filledSlots.map((slot, idx) => (
                  <div key={slot.id} className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-border/60 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {slot.preview && <img src={slot.preview} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">Post {idx + 1}</label>
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
                        className="h-20 resize-none text-sm rounded-xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Schedule Start Time Picker */}
            <div className="p-4 neu-pressed rounded-2xl space-y-3">
              <h4 className="font-display font-bold text-foreground text-sm">⏰ เวลาเริ่มตั้งโพสต์ (สำหรับปุ่ม Schedule)</h4>
              <ScheduleDateTimePicker
                schedule={schedule}
                accentColor="orange"
                showPreview={intervalMinutes === 0}
              />
            </div>

            {/* Timeline Preview */}
            <div className="p-4 neu-pressed rounded-2xl">
              <h4 className="font-display font-bold text-foreground text-sm mb-3">📅 Timeline การโพสต์ (เมื่อกด Schedule)</h4>
              <div className="space-y-2">
                {filledSlots.map((slot, idx) => {
                  const postTime = addMinutes(schedule.getScheduledDate(), idx * intervalMinutes);
                  return (
                    <div key={slot.id} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/25 text-xs font-extrabold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-border/60 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {slot.preview && <img src={slot.preview} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-foreground">Post {idx + 1}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {format(postTime, "EEEE d MMM yyyy HH:mm", { locale: th })} น.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <div className="flex gap-3">
              <Button
                variant="neu"
                disabled={isPublishing}
                onClick={() => handlePublish(false)}
                className="flex-1 h-11 font-bold rounded-xl"
              >
                {isPublishing ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />}
                Schedule
              </Button>
              <Button
                variant="tactile"
                disabled={isPublishing}
                onClick={() => handlePublish(true)}
                className="flex-1 h-11 font-bold rounded-xl"
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
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 border-4 ${allSucceeded ? "bg-emerald-500/12 border-emerald-500/25" : anyFailed && !allSucceeded ? "bg-amber-500/12 border-amber-500/25" : "bg-emerald-500/12 border-emerald-500/25"}`}>
              <CheckCircle2 className={`w-10 h-10 ${allSucceeded ? "text-emerald-500" : "text-amber-500"}`} />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-foreground mb-2">
              {allSucceeded ? "Posts Queued! 🎉" : "บางส่วนสำเร็จ ⚠️"}
            </h2>

            <div className="w-full space-y-2 mb-8">
              {publishResults.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    r.success
                      ? "bg-emerald-500/10 border-emerald-500/25"
                      : "bg-destructive/10 border-destructive/25"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      r.success
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-border/60 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {filledSlots[i]?.preview && <img src={filledSlots[i].preview!} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Post {i + 1}</p>
                    {!r.success && <p className="text-xs text-destructive">{r.error}</p>}
                  </div>
                  {r.success
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <AlertCircle className="w-4 h-4 text-destructive" />
                  }
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="neu" className="font-bold px-6 rounded-xl" onClick={() => window.location.href = "/dashboard/history"}>
                View History
              </Button>
              <Button
                variant="tactile"
                className="font-bold px-6 rounded-xl"
                onClick={() => {
                  setStep(1);
                  setPublishDone(false);
                  setPublishResults([]);
                  setTopic("");
                  setSharedCaption("");
                  setSlots([makeSlot(), makeSlot()]);
                  schedule.resetSchedule();
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
        sourceContent={sharedCaption.trim() || topic.trim()}
      />

      <AIArticleWriterModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        onUseArticle={(article) => setTopic(article)}
      />
    </div>
  );
}
