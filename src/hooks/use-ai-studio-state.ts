"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  generateAIArticleAction,
  getAIUsageStatsAction,
} from "@/lib/actions/ai-generation";
import { createDraftPost } from "@/lib/actions/posts";
import type { MediaGenerationMetadata } from "@/lib/validations/ai-media.schema";
import type { StudioAIUsageStats } from "@/app/dashboard/ai-studio/StudioUsageStatsBar";
import type { ArticleFormatKey } from "@/app/dashboard/ai-studio/StudioArticleWriterCard";

export function useAIStudioState() {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [selectedLength, setSelectedLength] = useState("medium");
  const [selectedLanguage, setSelectedLanguage] = useState("Thai");
  const [loadingArticle, setLoadingArticle] = useState(false);

  const [formats, setFormats] = useState<Record<ArticleFormatKey, string>>({
    longForm: "",
    socialPost: "",
    marketingAida: "",
  });
  const [selectedFormat, setSelectedFormat] = useState<ArticleFormatKey>("longForm");
  const [error, setError] = useState("");

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mediaMeta, setMediaMeta] = useState<MediaGenerationMetadata | null>(null);
  const [videoModalSourceImage, setVideoModalSourceImage] = useState<string | null>(null);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAutoPostModalOpen, setIsAutoPostModalOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isDraftSuccessOpen, setIsDraftSuccessOpen] = useState(false);
  const [stats, setStats] = useState<StudioAIUsageStats | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await getAIUsageStatsAction();
      if (res.success && res.stats) setStats(res.stats);
    } catch {
      // Non-critical stats display
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const handleGenerateArticle = async () => {
    if (!topic.trim()) {
      setError("กรุณากรอกหัวข้อบทความหลักก่อนสั่งเขียน");
      return;
    }
    setLoadingArticle(true);
    setError("");
    try {
      const res = await generateAIArticleAction(topic, selectedTone, selectedLength, selectedLanguage);
      if (res.success && res.formats) {
        setFormats(res.formats);
        setSelectedFormat("longForm");
        await loadStats();
      } else {
        setError(res.error || "เกิดข้อผิดพลาดในการสร้างบทความ กรุณาตรวจสอบการตั้งค่าคีย์ API");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดการเชื่อมต่อเครือข่าย");
    } finally {
      setLoadingArticle(false);
    }
  };

  const handleSaveDraft = async () => {
    const activeContent = formats[selectedFormat];
    if (!activeContent.trim()) return;
    setSavingDraft(true);
    setError("");
    try {
      const res = await createDraftPost({ content: activeContent, imageUrl: mediaUrl || undefined });
      if (res.success) setIsDraftSuccessOpen(true);
      else setError(res.error || "ไม่สามารถบันทึกแบบร่างได้");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกแบบร่าง");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSendToPublisher = (mode: "single" | "video") => {
    const activeContent = formats[selectedFormat];
    if (!activeContent.trim()) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "vibepost_studio_preset",
        JSON.stringify({ text: activeContent, mediaUrl: mediaUrl || "", mediaType, mode, timestamp: Date.now() })
      );
    }
    const textParam = encodeURIComponent(activeContent.substring(0, 300));
    const mediaParam = mediaUrl && !mediaUrl.startsWith("data:") ? encodeURIComponent(mediaUrl) : "";
    router.push(`/dashboard/multi-post?preset=studio&mode=${mode}&text=${textParam}&media=${mediaParam}&type=${mediaType}`);
  };

  return {
    router,
    topic, setTopic,
    selectedTone, setSelectedTone,
    selectedLength, setSelectedLength,
    selectedLanguage, setSelectedLanguage,
    loadingArticle,
    formats, setFormats,
    selectedFormat, setSelectedFormat,
    error,
    mediaUrl, setMediaUrl,
    mediaType, setMediaType,
    mediaMeta, setMediaMeta,
    videoModalSourceImage, setVideoModalSourceImage,
    isImageModalOpen, setIsImageModalOpen,
    isVideoModalOpen, setIsVideoModalOpen,
    isAutoPostModalOpen, setIsAutoPostModalOpen,
    savingDraft,
    isDraftSuccessOpen, setIsDraftSuccessOpen,
    stats,
    loadStats,
    handleGenerateArticle,
    handleSaveDraft,
    handleSendToPublisher,
  };
}
