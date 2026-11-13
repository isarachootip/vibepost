"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PostTypePicker } from "./PostTypePicker";
import { SinglePostWizard } from "./SinglePostWizard";
import { MultiImageWizard } from "./MultiImageWizard";
import { SequentialPostWizard } from "./SequentialPostWizard";
import { ArrowLeft, Loader2, Send } from "lucide-react";

type PostType = "single" | "multi" | "sequential" | "video";

export interface PublisherConnection {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
}

const TYPE_SUBTITLES: Record<PostType, string> = {
  single: "📸 Single Photo Post",
  video: "🎬 Video Clip Post",
  sequential: "📋 Sequential Posts",
  multi: "🖼️ Multi-Photo Album Post",
};

function EmptyConnectionsNotice() {
  return (
    <div className="neu-raised neu-grain rounded-2xl p-8 text-center">
      <p className="text-muted-foreground text-sm">
        No social connections found. Please add them in Integrations.
      </p>
    </div>
  );
}

function PublisherShellInner({ connections }: { connections: PublisherConnection[] }) {
  const searchParams = useSearchParams();
  const presetKey =
    searchParams.get("preset") === "studio"
      ? `${searchParams.get("mode") ?? ""}:${searchParams.get("type") ?? ""}`
      : "";
  const presetType: PostType | null =
    searchParams.get("preset") === "studio"
      ? searchParams.get("mode") === "video" || searchParams.get("type") === "video"
        ? "video"
        : "single"
      : null;

  const [override, setOverride] = useState<{ key: string; value: PostType | null } | null>(null);
  const selectedType = override && override.key === presetKey ? override.value : presetType;

  const handleSelectType = (type: PostType) => setOverride({ key: presetKey, value: type });
  const handleBack = () => setOverride({ key: presetKey, value: null });

  return (
    <div className="p-2 md:p-6 space-y-8 animate-in fade-in duration-500 min-h-screen">
      <header className="flex items-end justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl neu-tint-primary flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-extrabold text-foreground tracking-tight">
              AI Content Publisher
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-0.5">
              {selectedType ? TYPE_SUBTITLES[selectedType] : "เลือกประเภท Post ที่ต้องการสร้าง"}
            </p>
          </div>
        </div>
      </header>

      {!selectedType && <PostTypePicker onSelect={handleSelectType} />}

      {selectedType && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-3.5 py-2 rounded-xl neu-pressed text-xs font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> เปลี่ยนประเภท Post
            </button>
          </div>
          {connections.length === 0 ? (
            <EmptyConnectionsNotice />
          ) : selectedType === "single" ? (
            <SinglePostWizard connections={connections} />
          ) : selectedType === "multi" ? (
            <MultiImageWizard connections={connections} onBack={handleBack} />
          ) : selectedType === "sequential" ? (
            <SequentialPostWizard connections={connections} onBack={handleBack} />
          ) : (
            <SinglePostWizard connections={connections} defaultMediaType="video" />
          )}
        </div>
      )}
    </div>
  );
}

export function PublisherShell(props: { connections: PublisherConnection[] }) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      }
    >
      <PublisherShellInner {...props} />
    </Suspense>
  );
}
