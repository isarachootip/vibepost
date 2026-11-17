"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getCuratedVideosListAction } from "@/lib/actions/ai-generation";
import { saveCuratedStockVideoAction } from "@/lib/actions/veo-video.actions";
import { extractVisualPromptAction } from "@/lib/actions/visual-prompt";
import type { MediaGenerationMetadata } from "@/lib/validations/ai-media.schema";
import { useVeoStudioJobs } from "@/hooks/use-veo-studio-jobs";
import { VideoCardGrid, type VideoItem } from "./VideoCardGrid";
import { VideoSearchHeader } from "./VideoSearchHeader";
import { VeoFlowGeneratorPanel } from "./VeoFlowGeneratorPanel";
import { VeoActiveJobsList } from "./VeoActiveJobsList";
import { Clapperboard, Film, Sparkles } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (url: string, meta?: MediaGenerationMetadata) => void;
  initialPrompt?: string;
  sourceContent?: string;
  initialSourceImageUrl?: string | null;
};

export function AIVideoStudioModal({
  isOpen,
  onClose,
  onSelectVideo,
  initialPrompt,
  sourceContent,
  initialSourceImageUrl = null,
}: Props) {
  const [studioTab, setStudioTab] = useState<"veo" | "stock">("veo");
  const [prompt, setPrompt] = useState("");
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(initialSourceImageUrl);
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [savingStockId, setSavingStockId] = useState<string | null>(null);
  const [previewingVideoId, setPreviewingVideoId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const veo = useVeoStudioJobs(isOpen, setError);
  const rawContext = sourceContent?.trim() || initialPrompt?.trim() || "";

  const runVideoPromptExtraction = useCallback(async (textToExtract: string) => {
    if (!textToExtract.trim()) return;
    setExtracting(true);
    try {
      const res = await extractVisualPromptAction({ content: textToExtract, mediaType: "video" });
      if (res.success) {
        setPrompt(res.englishPrompt);
        setSelectedCategory(res.suggestedCategory || "trending");
      }
    } finally {
      setExtracting(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setStudioTab("veo");
      setSourceImageUrl(initialSourceImageUrl ?? null);
      if (rawContext) void runVideoPromptExtraction(rawContext);
    }
  }, [isOpen, initialSourceImageUrl, rawContext, runVideoPromptExtraction]);

  useEffect(() => {
    void getCuratedVideosListAction()
      .then((res) => {
        if (res.success && res.videos) setVideos(res.videos);
      })
      .finally(() => setLoadingList(false));
  }, []);

  const handleSelectStockVideo = async (vid: VideoItem) => {
    setSavingStockId(vid.id);
    setError("");
    try {
      const res = await saveCuratedStockVideoAction(vid.videoUrl);
      if (res.success && res.fileUrl) {
        onSelectVideo(res.fileUrl, {
          resolvedEnglishPrompt: vid.title,
          keywords: vid.tags,
          requestedProvider: "FREE",
          actualProvider: "FREE",
          actualModel: "pexels-stock-video",
          usedFallback: false,
        });
        onClose();
      } else {
        setError(res.error || "เลือกวิดีโอสต็อกไม่สำเร็จ");
      }
    } finally {
      setSavingStockId(null);
    }
  };

  const filteredVideos = videos.filter((v) =>
    selectedCategory === "trending" || selectedCategory === "custom" ? true : v.category === selectedCategory
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="mb-2">
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-primary" />
            Google Flow &amp; AI Video Studio
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-xs">
            สร้างคลิปพร้อมเสียงด้วยโมเดล Google Veo 3.1 (Text / Image-to-Video) แบบทำงานเบื้องหลัง หรือเลือกคลิปสต็อกฟรีด้วยตนเอง
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl neu-pressed">
          <button
            type="button"
            onClick={() => setStudioTab("veo")}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              studioTab === "veo" ? "bg-[var(--surface-elevated)] text-foreground shadow-xs border border-border/70" : "text-muted-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" /> 🎬 Google Flow (Veo 3.1 AI)
          </button>
          <button
            type="button"
            onClick={() => setStudioTab("stock")}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              studioTab === "stock" ? "bg-[var(--surface-elevated)] text-foreground shadow-xs border border-border/70" : "text-muted-foreground"
            }`}
          >
            <Film className="w-3.5 h-3.5 text-teal-500" /> 📼 คลังวิดีโอสต็อกฟรี (Pexels)
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-destructive/12 border border-destructive/30 text-destructive rounded-xl text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {studioTab === "veo" ? (
          <div className="space-y-5">
            <VeoFlowGeneratorPanel
              prompt={prompt}
              onPromptChange={setPrompt}
              sourceImageUrl={sourceImageUrl}
              onSourceImageChange={setSourceImageUrl}
              extracting={extracting}
              submitting={veo.submittingVeo}
              canReExtract={Boolean(rawContext)}
              hasGeminiKey={veo.hasGeminiKey}
              quota={veo.quota}
              onReExtract={() => void runVideoPromptExtraction(rawContext)}
              onSubmitJob={(opts) =>
                void veo.startVeoJob({ prompt, sourceImageUrl, ...opts })
              }
            />
            <VeoActiveJobsList
              jobs={veo.veoJobs}
              polling={veo.polling}
              onRefresh={() => void veo.refreshVeoJobs()}
              onSelectCompletedVideo={(url, meta) => {
                onSelectVideo(url, meta);
                onClose();
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <VideoSearchHeader
              prompt={prompt}
              onPromptChange={setPrompt}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              extracting={extracting}
              generating={Boolean(savingStockId)}
              isGeneratingCustom={false}
              canReExtract={Boolean(rawContext)}
              onReExtract={() => void runVideoPromptExtraction(rawContext)}
              onGenerateAI={() => setStudioTab("veo")}
            />
            <VideoCardGrid
              loadingList={loadingList}
              videos={filteredVideos}
              generating={Boolean(savingStockId)}
              activeVideoId={savingStockId}
              previewingVideoId={previewingVideoId}
              onTogglePreview={(id) => setPreviewingVideoId((p) => (p === id ? null : id))}
              onSelectVideoItem={(vid) => void handleSelectStockVideo(vid)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
