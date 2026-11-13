"use client";

import React, { useState, useRef, useCallback } from "react";
import { generateAIPost, createScheduledPost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  CalendarIcon, Sparkles, Send, CheckCircle2, RefreshCcw,
  Upload, X, LayoutTemplate, ArrowLeft, PenTool,
  GripVertical, Plus, AlertCircle, Images
} from "lucide-react";
import { useFutureSchedule } from "@/hooks/use-future-schedule";
import { ScheduleDateTimePicker } from "@/components/scheduling/ScheduleDateTimePicker";

import { AIImageCreatorModal } from "./AIImageCreatorModal";
import { AIArticleWriterModal } from "./AIArticleWriterModal";

type Connection = { id: string; platform: string; accountName: string; isActive: boolean };

const LANGUAGES = ["Thai", "English", "Japanese", "Chinese", "Korean", "French", "German", "Spanish", "Arabic", "Vietnamese", "Indonesian"];

type ImageSlot = { id: string; file: File | null; preview: string | null; url: string | null; uploading: boolean; error: string };

let uid = 0;
function emptySlot(): ImageSlot {
  return { id: `s${++uid}`, file: null, preview: null, url: null, uploading: false, error: "" };
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
  const [slots, setSlots] = useState<ImageSlot[]>([emptySlot(), emptySlot(), emptySlot(), emptySlot()]);

  // Drag-to-reorder state
  const dragIndex = useRef<number | null>(null);

  // Drop zone
  const [isDragOver, setIsDragOver] = useState(false);

  // Modals
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [aiActiveSlotIndex, setAiActiveSlotIndex] = useState<number | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState("");

  const schedule = useFutureSchedule();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const filledSlots = slots.filter(s => s.url !== null);
  const anyUploading = slots.some(s => s.uploading);

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

    // Expand slots to fit new files (max 10)
    setSlots(prev => {
      const emptyCount = prev.filter(s => !s.file).length;
      const extra = Math.max(0, files.length - emptyCount);
      return [...prev, ...Array.from({ length: extra }, emptySlot)].slice(0, 10);
    });

    for (const file of files) {
      const preview = URL.createObjectURL(file);
      setSlots(prev => {
        const emptyIdx = prev.findIndex(s => !s.file);
        if (emptyIdx < 0) return prev;
        const next = [...prev];
        next[emptyIdx] = { ...next[emptyIdx], file, preview, uploading: true, error: "" };
        return next;
      });

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
  };

  const clearSlot = (index: number) => {
    setSlots(prev => {
      const next = [...prev];
      if (next[index].preview) URL.revokeObjectURL(next[index].preview!);
      next[index] = { ...emptySlot(), id: next[index].id };
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
    setSlots(prev => [...prev, emptySlot()]);
  };

  const toggleChannel = (id: string) =>
    setSelectedChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("กรุณาใส่ Topic"); return; }
    if (selectedChannels.length === 0) { setError("กรุณาเลือก Channel อย่างน้อย 1 ช่อง"); return; }
    if (filledSlots.length === 0) { setError("กรุณาอัปโหลดรูปอย่างน้อย 1 รูป"); return; }
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
    if (filledSlots.length === 0) { setError("กรุณาอัปโหลดรูปอย่างน้อย 1 รูป"); return; }
    setError(""); setIsPublishing(true);

    const publishDate = isPostNow ? new Date() : schedule.getScheduledDate();

    const imageUrls = filledSlots.map(s => s.url!);
    const res = await createScheduledPost({
      content: selectedContent,
      scheduledTime: isPostNow ? null : publishDate,
      publishMode: isPostNow ? "NOW" : "SCHEDULE",
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
            <Images className="w-4 h-4 text-teal-500" />
            Album Post
          </h2>
          <p className="text-xs text-muted-foreground">
            {filledSlots.length} รูปใน Post เดียว — ลาก ⠿ เรียงลำดับได้
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${step >= s ? "bg-teal-500" : "bg-border/70"}`} />
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ─── STEP 1 ─── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDropZone}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isDragOver
                  ? "border-teal-500/60 bg-teal-500/10"
                  : "border-border/70 neu-pressed hover:border-teal-500/40"
              }`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? "text-teal-500" : "text-muted-foreground"}`} />
              <p className="text-sm font-bold text-foreground/85">ลากรูปหลายรูปมาวางที่นี่</p>
              <p className="text-xs text-muted-foreground mt-1">รูปทั้งหมดจะรวมอยู่ใน Album Post เดียว (สูงสุด 10 รูป)</p>
            </div>

            {/* Image Slots with Drag Reorder */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-foreground">
                  🖼️ รูปใน Album ({filledSlots.length}/{slots.length} รูป)
                </label>
                {slots.length < 10 && (
                  <button
                    type="button"
                    onClick={addSlot}
                    className="flex items-center gap-1 text-xs font-bold neu-tint-teal px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
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
                    onDragOver={handleDragOver}
                    onDrop={e => handleDrop(e, idx)}
                    className="flex items-center gap-3 p-3 neu-pressed rounded-xl group hover:border-teal-500/35 border border-border/60 transition-all"
                  >
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground shrink-0">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Order Badge */}
                    <div className="w-7 h-7 rounded-full neu-tint-teal text-xs font-extrabold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-border/60 shrink-0 relative bg-[var(--surface-recessed)]">
                      {slot.preview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={slot.preview} alt={`img-${idx + 1}`} className="w-full h-full object-cover" />
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

                    {/* Status */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground">รูปที่ {idx + 1} ของ Album</div>
                      {slot.error && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3" /> {slot.error}
                        </p>
                      )}
                      {!slot.preview && (
                        <p className="text-xs text-muted-foreground mt-0.5">ยังไม่มีรูป</p>
                      )}
                      {slot.url && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">✅ พร้อมโพสต์</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 shrink-0">
                      {!slot.preview ? (
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
                            onClick={() => { setAiActiveSlotIndex(idx); setIsImageModalOpen(true); }}
                            className="text-[10px] font-bold neu-tint-primary px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <Sparkles className="w-3 h-3 animate-pulse" /> AI
                          </button>
                        </>
                      ) : (
                        !slot.uploading && (
                          <button
                            type="button"
                            onClick={() => clearSlot(idx)}
                            className="text-[10px] font-bold bg-[var(--surface-elevated)] border border-border/70 hover:border-destructive/40 text-muted-foreground hover:text-destructive px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <RefreshCcw className="w-3 h-3" /> เปลี่ยน
                          </button>
                        )
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
                <div className="mt-3 p-3 neu-tint-teal rounded-xl">
                  <p className="text-xs font-bold">
                    🖼️ {filledSlots.length} รูปจะรวมอยู่ใน <span className="underline">1 Post</span> แบบ Facebook Album
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
                        ? "neu-tint-teal"
                        : "neu-pressed border-border/60 text-muted-foreground hover:text-foreground"
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
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-foreground">✏️ Topic / หัวข้อ</label>
                  <Button
                    type="button"
                    variant="neu"
                    onClick={() => setIsArticleModalOpen(true)}
                    className="text-primary text-[10px] font-bold flex items-center gap-1 py-1 h-7 rounded-lg"
                  >
                    <PenTool className="w-3 h-3" /> ✍️ AI Article Writer
                  </Button>
                </div>
                <Textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="เช่น: อาหารไทยแบบครบ 4 ช่วงเวลา"
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
              disabled={isGenerating || anyUploading || !topic.trim() || selectedChannels.length === 0 || filledSlots.length === 0}
              className="w-full h-12 font-bold rounded-xl"
            >
              {isGenerating
                ? <><RefreshCcw className="w-5 h-5 animate-spin mr-2" /> กำลัง Generate...</>
                : <><Sparkles className="w-5 h-5 mr-2" /> Generate AI Content</>
              }
            </Button>
          </div>
        )}

        {/* ─── STEP 2 ─── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-teal-500" /> เลือก Variant ที่ชอบ
              </h3>
              <Button variant="neu" size="sm" onClick={() => setStep(1)}>ย้อนกลับ</Button>
            </div>

            {/* Image Preview Strip — shows order */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filledSlots.map((slot, i) => (
                <div key={slot.id} className="relative shrink-0">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-border/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {slot.preview && <img src={slot.preview} alt={`img-${i}`} className="w-full h-full object-cover" />}
                  </div>
                  <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-[9px] font-black flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
              ))}
              <div className="w-14 h-14 rounded-lg border border-dashed border-border/70 flex items-center justify-center text-xs text-muted-foreground shrink-0">
                {filledSlots.length} รูป
              </div>
            </div>

            {/* Variant Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {variants.map((v, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedContent(v)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedContent === v
                      ? "neu-tint-teal ring-2 ring-teal-500/25"
                      : "neu-pressed border-border/60 hover:border-border"
                  }`}
                >
                  <div className="text-xs font-bold text-teal-600 dark:text-teal-400 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Option {i + 1}
                  </div>
                  <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">{v}</p>
                </div>
              ))}
            </div>

            {selectedContent && (
              <div className="space-y-4 animate-in fade-in">
                <Textarea
                  value={selectedContent}
                  onChange={e => setSelectedContent(e.target.value)}
                  className="h-32 resize-none rounded-xl"
                />

                {/* Scheduling */}
                <div className="p-5 rounded-2xl neu-pressed space-y-4">
                  <h4 className="font-display font-bold text-foreground text-sm">📅 กำหนดเวลาเผยแพร่</h4>
                  <ScheduleDateTimePicker schedule={schedule} accentColor="blue" />

                  {filledSlots.length === 0 && (
                    <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/12 border border-amber-500/30 rounded-lg px-3 py-2">
                      ⚠️ ต้องมีรูปอย่างน้อย 1 รูป
                    </div>
                  )}

                  {error && <p className="text-destructive text-sm">{error}</p>}

                  <div className="flex gap-3">
                    <Button
                      variant="neu"
                      disabled={isPublishing || filledSlots.length === 0}
                      onClick={() => handlePublish(false)}
                      className="flex-1 h-11 font-bold rounded-xl"
                    >
                      {isPublishing ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />}
                      Schedule
                    </Button>
                    <Button
                      variant="tactile"
                      disabled={isPublishing || filledSlots.length === 0}
                      onClick={() => handlePublish(true)}
                      className="flex-1 h-11 font-bold rounded-xl"
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

        {/* ─── STEP 3 ─── */}
        {step === 3 && publishSuccess && (
          <div className="flex flex-col items-center justify-center py-16 animate-in zoom-in-95">
            <div className="w-24 h-24 neu-tint-teal rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="font-display text-3xl font-extrabold text-foreground mb-2">Album Queued! 🎉</h2>
            <p className="text-muted-foreground text-sm mb-4">{filledSlots.length} รูปจะโพสต์เป็น Album เดียว</p>
            {scheduledDateTime && (
              <div className="px-5 py-3 neu-pressed rounded-xl text-sm text-center mb-6">
                <p className="text-muted-foreground">กำหนดโพสต์วันที่</p>
                <p className="font-bold text-foreground mt-0.5">
                  {format(scheduledDateTime, "EEEE d MMMM yyyy", { locale: th })} เวลา {format(scheduledDateTime, "HH:mm")} น.
                </p>
              </div>
            )}
            {/* Image Preview Strip */}
            <div className="flex gap-2 mb-8">
              {filledSlots.slice(0, 6).map((s, i) => (
                <div key={i} className="relative">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {s.preview && <img src={s.preview} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-teal-500 text-white text-[8px] font-black flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
              ))}
              {filledSlots.length > 6 && (
                <div className="w-12 h-12 rounded-lg neu-pressed flex items-center justify-center text-xs font-bold text-muted-foreground">
                  +{filledSlots.length - 6}
                </div>
              )}
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
                  setPublishSuccess(false);
                  setTopic("");
                  setSelectedContent("");
                  setVariants([]);
                  setScheduledDateTime(null);
                  setSlots([emptySlot(), emptySlot(), emptySlot(), emptySlot()]);
                  schedule.resetSchedule();
                }}
              >
                สร้าง Album ใหม่
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* AI Modals */}
      <AIImageCreatorModal
        isOpen={isImageModalOpen}
        onClose={() => { setIsImageModalOpen(false); setAiActiveSlotIndex(null); }}
        onSelectImage={(url) => {
          if (aiActiveSlotIndex !== null) {
            setSlots(prev => {
              const next = [...prev];
              next[aiActiveSlotIndex] = { ...next[aiActiveSlotIndex], file: null, preview: url, url, uploading: false, error: "" };
              return next;
            });
          }
        }}
        sourceContent={selectedContent.trim() || topic.trim()}
      />

      <AIArticleWriterModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        onUseArticle={(article) => setTopic(article)}
      />
    </div>
  );
}
