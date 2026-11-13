"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { generateAIVideoAction, getCuratedVideosListAction } from "@/lib/actions/ai-generation";
import { extractVisualPromptAction } from "@/lib/actions/visual-prompt";
import type { MediaGenerationMetadata } from "@/lib/validations/ai-media.schema";
import { VideoCardGrid, type VideoItem } from "./VideoCardGrid";
import { VideoSearchHeader } from "./VideoSearchHeader";
import { Clapperboard } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (url: string, meta?: MediaGenerationMetadata) => void;
  initialPrompt?: string;
  sourceContent?: string;
};

export function AIVideoStudioModal({ isOpen, onClose, onSelectVideo, initialPrompt, sourceContent }: Props) {
  const [prompt, setPrompt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [previewingVideoId, setPreviewingVideoId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const rawContext = sourceContent?.trim() || initialPrompt?.trim() || "";

  const runVideoPromptExtraction = useCallback(async (textToExtract: string) => {
    if (!textToExtract.trim()) return;
    setExtracting(true);
    setError("");
    try {
      const res = await extractVisualPromptAction({ content: textToExtract, mediaType: "video" });
      if (res.success) {
        setPrompt(res.englishPrompt);
        setSelectedCategory(res.suggestedCategory || "trending");
      }
    } catch {
      // Keep manual input on extraction error
    } finally {
      setExtracting(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError("");
      if (rawContext) void runVideoPromptExtraction(rawContext);
    }
  }, [isOpen, rawContext, runVideoPromptExtraction]);

  useEffect(() => {
    async function loadVideos() {
      try {
        const res = await getCuratedVideosListAction();
        if (res.success && res.videos) setVideos(res.videos);
      } catch (err) {
        console.error("Failed to load curated videos", err);
      } finally {
        setLoadingList(false);
      }
    }
    void loadVideos();
  }, []);

  const filteredVideos = videos.filter((video) => {
    if (selectedCategory === "custom") {
      const tokens = prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length >= 3);
      if (tokens.length === 0) return true;
      const haystack = `${video.title} ${video.category} ${video.tags.join(" ")}`.toLowerCase();
      return tokens.some((tok) => haystack.includes(tok));
    }
    if (selectedCategory === "trending") return true;
    return video.category === selectedCategory;
  });

  const handleRunVideoGeneration = async (targetPrompt: string, cat: string, vidId: string | null) => {
    if (!targetPrompt.trim()) {
      setError("กรุณาระบุ English Prompt หรือคีย์เวิร์ดวิดีโอ");
      return;
    }
    setGenerating(true);
    setActiveVideoId(vidId);
    setError("");
    try {
      const res = await generateAIVideoAction(targetPrompt, cat);
      if (res.success && res.asset) {
        onSelectVideo(res.asset.fileUrl, res.meta);
        onClose();
        setActiveVideoId(null);
      } else {
        setError(res.error || "เกิดข้อผิดพลาดในการสร้างหรือดาวน์โหลดวิดีโอ");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดด้านการเชื่อมต่อเครือข่าย");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="mb-3">
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-primary animate-pulse" />
            AI Video Studio
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-xs">
            สกัด English Video Prompt &amp; หมวดหมู่จากเนื้อหาอัตโนมัติ แก้ไขได้ก่อนค้นหาหรือเจนวิดีโอ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {error && (
            <div className="p-3.5 bg-destructive/12 border border-destructive/30 text-destructive rounded-xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <VideoSearchHeader
            prompt={prompt}
            onPromptChange={setPrompt}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            extracting={extracting}
            generating={generating}
            isGeneratingCustom={generating && activeVideoId === "custom-ai"}
            canReExtract={Boolean(rawContext)}
            onReExtract={() => void runVideoPromptExtraction(rawContext)}
            onGenerateAI={() => void handleRunVideoGeneration(prompt, selectedCategory, "custom-ai")}
          />

          <VideoCardGrid
            loadingList={loadingList}
            videos={filteredVideos}
            generating={generating}
            activeVideoId={activeVideoId}
            previewingVideoId={previewingVideoId}
            onTogglePreview={(vidId) => setPreviewingVideoId((prev) => (prev === vidId ? null : vidId))}
            onSelectVideoItem={(vid) => void handleRunVideoGeneration(vid.title, vid.category, vid.id)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
