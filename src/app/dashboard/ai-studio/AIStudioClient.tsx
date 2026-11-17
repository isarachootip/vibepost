"use client";

import React from "react";
import { AIImageCreatorModal } from "../multi-post/AIImageCreatorModal";
import { AIVideoStudioModal } from "../multi-post/AIVideoStudioModal";
import { StudioAutoPostModal } from "./StudioAutoPostModal";
import { StudioUsageStatsBar } from "./StudioUsageStatsBar";
import { StudioArticleWriterCard } from "./StudioArticleWriterCard";
import { StudioMediaDesignerCard } from "./StudioMediaDesignerCard";
import { StudioDraftSavedDialog } from "./StudioDraftSavedDialog";
import { useAIStudioState } from "@/hooks/use-ai-studio-state";
import { Sparkles } from "lucide-react";

type Connection = {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
};

export function AIStudioClient({ connections = [] }: { connections?: Connection[] }) {
  const s = useAIStudioState();

  return (
    <div className="p-2 md:p-6 space-y-8 animate-in fade-in duration-500 min-h-screen w-full max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/60 pb-5 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl neu-tint-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              AI Creator <span className="text-primary">Studio</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-0.5">
              แต่งบทความระดับคุณภาพ สร้างรูปภาพ และผลิตคลิปวิดีโอด้วย Google Flow (Veo 3.1) ครบจบในที่เดียว
            </p>
          </div>
        </div>
      </header>

      {s.error && (
        <div className="p-4 bg-destructive/12 border border-destructive/30 text-destructive rounded-2xl text-sm font-semibold max-w-7xl mx-auto">
          ⚠️ {s.error}
        </div>
      )}

      {s.stats && <StudioUsageStatsBar stats={s.stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        <StudioArticleWriterCard
          topic={s.topic}
          onTopicChange={s.setTopic}
          selectedTone={s.selectedTone}
          onToneChange={s.setSelectedTone}
          selectedLength={s.selectedLength}
          onLengthChange={s.setSelectedLength}
          selectedLanguage={s.selectedLanguage}
          onLanguageChange={s.setSelectedLanguage}
          loadingArticle={s.loadingArticle}
          formats={s.formats}
          selectedFormat={s.selectedFormat}
          onSelectFormat={s.setSelectedFormat}
          onEditorChange={(val) => s.setFormats((prev) => ({ ...prev, [s.selectedFormat]: val }))}
          onGenerateArticle={() => void s.handleGenerateArticle()}
        />

        <StudioMediaDesignerCard
          mediaUrl={s.mediaUrl}
          mediaType={s.mediaType}
          mediaMeta={s.mediaMeta}
          hasActiveContent={Boolean(s.formats[s.selectedFormat].trim())}
          savingDraft={s.savingDraft}
          onClearMedia={() => {
            s.setMediaUrl(null);
            s.setMediaMeta(null);
          }}
          onOpenImageModal={() => s.setIsImageModalOpen(true)}
          onOpenVideoModal={() => {
            s.setVideoModalSourceImage(null);
            s.setIsVideoModalOpen(true);
          }}
          onAnimateCurrentImage={() => {
            s.setVideoModalSourceImage(s.mediaUrl);
            s.setIsVideoModalOpen(true);
          }}
          onOpenAutoPostModal={() => s.setIsAutoPostModalOpen(true)}
          onSaveDraft={() => void s.handleSaveDraft()}
          onSendToPublisher={s.handleSendToPublisher}
        />
      </div>

      <StudioDraftSavedDialog
        open={s.isDraftSuccessOpen}
        onOpenChange={s.setIsDraftSuccessOpen}
        onGoToDrafts={() => s.router.push("/dashboard/history")}
      />

      <StudioAutoPostModal
        isOpen={s.isAutoPostModalOpen}
        onClose={() => s.setIsAutoPostModalOpen(false)}
        content={s.formats[s.selectedFormat]}
        mediaUrl={s.mediaUrl}
        mediaType={s.mediaType}
        connections={connections}
        onOpenAdvancedWizard={() => {
          s.setIsAutoPostModalOpen(false);
          s.handleSendToPublisher(s.mediaType === "video" && s.mediaUrl ? "video" : "single");
        }}
      />

      <AIImageCreatorModal
        isOpen={s.isImageModalOpen}
        onClose={() => {
          s.setIsImageModalOpen(false);
          void s.loadStats();
        }}
        onSelectImage={(url, meta) => {
          s.setMediaUrl(url);
          s.setMediaType("image");
          s.setMediaMeta(meta ?? null);
        }}
        sourceContent={s.formats[s.selectedFormat].trim() || s.topic.trim()}
      />

      <AIVideoStudioModal
        isOpen={s.isVideoModalOpen}
        onClose={() => {
          s.setIsVideoModalOpen(false);
          void s.loadStats();
        }}
        onSelectVideo={(url, meta) => {
          s.setMediaUrl(url);
          s.setMediaType("video");
          s.setMediaMeta(meta ?? null);
        }}
        sourceContent={s.formats[s.selectedFormat].trim() || s.topic.trim()}
        initialSourceImageUrl={s.videoModalSourceImage}
      />
    </div>
  );
}
