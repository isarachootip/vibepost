"use client";

import React, { useState } from "react";
import { generateAIPost, createScheduledPost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { 
  CalendarIcon, Sparkles, Send, CheckCircle2, RefreshCcw, 
  Image as ImageIcon, Bot, LayoutTemplate
} from "lucide-react";
import { useFutureSchedule } from "@/hooks/use-future-schedule";
import { ScheduleDateTimePicker } from "@/components/scheduling/ScheduleDateTimePicker";

type Connection = {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
};

export function MultiPostWizard({ connections }: { connections: Connection[] }) {
  const [step, setStep] = useState(1);
  const [selectedChannels, setถูกเลือกแล้วChannels] = useState<string[]>([]);
  
  // Step 1 State
  const [topic, setTopic] = useState("");
  const [variantCount, setVariantCount] = useState("3");
  const [language, setLanguage] = useState("Thai");
  // imageUrl now stores the server-uploaded public URL (not blob/base64)
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  // Step 2 & 3 State
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [selectedContent, setถูกเลือกแล้วContent] = useState("");
  
  // Step 4 State
  const schedule = useFutureSchedule();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const toggleChannel = (id: string) => {
    setถูกเลือกแล้วChannels(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately (local blob for display only)
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setImageUrl(null);
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

      setImageUrl(data.url); // This is the public server URL Facebook can access
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(`Upload failed: ${msg}`);
      setImagePreview(null);
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
      setStep(3);
    } else {
      setError(res.error || "Failed to generate content.");
      setStep(1); // Go back if error
    }
  };

  const handlePublish = async (isPostNow: boolean) => {
    if (!selectedContent.trim()) {
      setError("Content cannot be empty.");
      return;
    }

    setError("");
    setIsPublishing(true);

    const publishDate = isPostNow ? new Date() : schedule.getScheduledDate();

    const res = await createScheduledPost({
      content: selectedContent,
      scheduledTime: isPostNow ? null : publishDate,
      publishMode: isPostNow ? "NOW" : "SCHEDULE",
      targetConnectionIds: selectedChannels,
      imageUrl: imageUrl || undefined,
    });

    setIsPublishing(false);

    if (res.success) {
      setPublishSuccess(true);
      setScheduledDateTime(publishDate);
      setStep(4);
    } else {
      setError(res.error || "Failed to schedule post.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 px-4 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border/70 -z-10 rounded-full" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
          style={{ width: `${(step / 4) * 100}%` }}
        />

        {[1, 2, 3, 4].map((num) => (
          <div
            key={num}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 border ${
              step >= num
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "neu-pressed text-muted-foreground border-border/70"
            }`}
          >
            {num}
          </div>
        ))}
      </div>

      <div className="neu-raised neu-grain rounded-3xl p-6 md:p-8 relative overflow-hidden min-h-[400px]">
        {error && (
          <div className="mb-4 p-4 bg-destructive/12 border border-destructive/30 text-destructive rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: Input Phase */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-8">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground mb-4 border-b border-border/60 pb-2">
                1. Select Target Channels
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {connections.map((conn) => {
                  const isActive = selectedChannels.includes(conn.id);
                  return (
                    <button
                      key={conn.id}
                      type="button"
                      onClick={() => toggleChannel(conn.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isActive
                          ? "neu-tint-primary"
                          : "neu-pressed border-border/60 hover:border-border text-foreground"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {conn.platform}
                        </span>
                        {isActive && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="text-sm font-semibold text-foreground truncate">
                        {conn.accountName}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-4 border-b border-border/60 pb-2">
                  2. Topic &amp; Instructions
                </h3>
                <Textarea
                  placeholder="e.g. โปรโมชั่นหน้าร้อน ซื้อ 1 แถม 1..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-32 resize-none rounded-xl"
                />

                <div className="mt-4">
                  <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wide">
                    Variations to Generate
                  </label>
                  <select
                    value={variantCount}
                    onChange={(e) => setVariantCount(e.target.value)}
                    className="w-full neu-pressed bg-[var(--surface-recessed)] border border-border/60 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium [&>option]:bg-[var(--surface-elevated)] [&>option]:text-foreground"
                  >
                    <option value="1">1 Option</option>
                    <option value="3">3 Options</option>
                    <option value="5">5 Options</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wide">
                    🌐 Language / ภาษา
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full neu-pressed bg-[var(--surface-recessed)] border border-border/60 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium [&>option]:bg-[var(--surface-elevated)] [&>option]:text-foreground"
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
                <h3 className="font-display text-lg font-bold text-foreground mb-4 border-b border-border/60 pb-2">
                  3. Attach Media
                </h3>
                <label
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors h-32 flex flex-col items-center justify-center cursor-pointer block ${
                    isUploading
                      ? "border-sky-500/40 bg-sky-500/10"
                      : imageUrl
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-border/70 neu-pressed hover:border-primary/40"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <>
                      <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-sm font-medium text-sky-600 dark:text-sky-300">Uploading to server...</p>
                    </>
                  ) : imageUrl ? (
                    <>
                      <ImageIcon className="w-8 h-8 text-emerald-500 mb-2" />
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300">
                        ✅ Image uploaded successfully!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Click to change image</p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground/80">Click to upload image/video</p>
                      <p className="text-xs text-muted-foreground mt-1">(Select a file from your computer)</p>
                    </>
                  )}
                </label>
                {uploadError && <p className="mt-2 text-sm text-destructive">{uploadError}</p>}
                {imagePreview && (
                  <div className="mt-4 relative w-full h-24 rounded-xl overflow-hidden border border-border/60 shadow-sm">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    {isUploading && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center">
                        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 flex justify-end border-t border-border/60">
              <Button
                variant="tactile"
                onClick={handleGenerate}
                className="px-8 py-6 rounded-xl font-bold text-lg"
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
              <div className="absolute inset-0 border-4 border-border/50 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
              <Bot className="absolute inset-0 m-auto w-10 h-10 text-muted-foreground animate-pulse" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              AI is drafting your content...
            </h2>
            <p className="text-muted-foreground font-medium">
              Analyzing topic and generating {variantCount} variations.
            </p>
          </div>
        )}

        {/* STEP 3: Selection Phase */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-8">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <LayoutTemplate className="text-primary" /> Choose the Best Variant
              </h3>
              <Button variant="neu" className="font-medium" onClick={() => setStep(1)}>
                ย้อนกลับ to Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {variants.map((variant, idx) => (
                <div
                  key={idx}
                  onClick={() => setถูกเลือกแล้วContent(variant)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedContent === variant
                      ? "neu-tint-primary ring-2 ring-primary/25"
                      : "neu-pressed border-border/60 hover:border-border"
                  }`}
                >
                  <div className="text-xs font-bold text-primary mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Option {idx + 1}
                  </div>
                  <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">{variant}</p>
                </div>
              ))}
            </div>

            {selectedContent && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider border-b border-border/60 pb-2">
                  Fine-tune your selected content:
                </h4>
                <Textarea
                  value={selectedContent}
                  onChange={(e) => setถูกเลือกแล้วContent(e.target.value)}
                  className="h-40 resize-none text-lg leading-relaxed rounded-2xl"
                />

                <div className="mt-8 p-6 rounded-2xl neu-pressed">
                  <h4 className="font-display text-base font-bold text-foreground mb-4">📅 กำหนดเวลาเผยแพร่</h4>
                  <div className="flex flex-col gap-4">
                    <ScheduleDateTimePicker schedule={schedule} accentColor="purple" />

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="neu"
                        disabled={isPublishing}
                        onClick={() => handlePublish(false)}
                        className="flex-1 h-12 font-bold px-6 rounded-xl"
                      >
                        {isPublishing ? (
                          <RefreshCcw className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          <CalendarIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                        )}
                        Schedule
                      </Button>
                      <Button
                        variant="tactile"
                        disabled={isPublishing}
                        onClick={() => handlePublish(true)}
                        className="flex-1 h-12 font-bold px-8 rounded-xl"
                      >
                        {isPublishing ? (
                          <RefreshCcw className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          <Send className="w-5 h-5 mr-2" />
                        )}
                        Post Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Success Phase */}
        {step === 4 && publishSuccess && (
          <div className="h-[400px] flex flex-col items-center justify-center animate-in zoom-in-95">
            <div className="w-24 h-24 bg-emerald-500/12 border-4 border-emerald-500/25 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">Content Queued! 🎉</h2>
            {scheduledDateTime && (
              <div className="mt-2 mb-4 px-5 py-3 neu-pressed rounded-xl text-sm text-center">
                <p className="text-muted-foreground text-xs">กำหนดโพสต์วันที่</p>
                <p className="font-bold text-foreground text-base mt-0.5">
                  {format(scheduledDateTime, "EEEE d MMMM yyyy", { locale: th })} เวลา{" "}
                  {format(scheduledDateTime, "HH:mm")} น.
                </p>
              </div>
            )}
            <p className="text-muted-foreground text-center max-w-md font-medium">
              โพสต์ถูกบันทึกแล้ว รอ Auto-Publisher ส่งตามเวลาที่กำหนด
            </p>
            <div className="mt-8 flex gap-4">
              <Button
                variant="neu"
                className="font-bold px-6 py-6 rounded-xl"
                onClick={() => (window.location.href = "/dashboard/history")}
              >
                View History
              </Button>
              <Button
                variant="tactile"
                className="font-bold px-6 py-6 rounded-xl"
                onClick={() => {
                  setStep(1);
                  setPublishSuccess(false);
                  setTopic("");
                  setถูกเลือกแล้วContent("");
                  setImageUrl(null);
                  setImagePreview(null);
                  setScheduledDateTime(null);
                  schedule.resetSchedule();
                }}
              >
                Create Another Post
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
