"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PostTypePicker } from "./PostTypePicker";
import { SinglePostWizard } from "./SinglePostWizard";
import { MultiImageWizard } from "./MultiImageWizard";
import { SequentialPostWizard } from "./SequentialPostWizard";
import { Send, Loader2 } from "lucide-react";

type PostType = "single" | "multi" | "sequential" | "video";
type Connection = { id: string; platform: string; accountName: string; isActive: boolean };

function PublisherShellInner({ connections }: { connections: Connection[] }) {
  const [selectedType, setSelectedType] = useState<PostType | null>(null);
  const searchParams = useSearchParams();

  // Auto-select type when redirected from AI Studio with preset params
  useEffect(() => {
    const preset = searchParams.get("preset");
    if (preset === "studio") {
      const mode = searchParams.get("mode");
      const type = searchParams.get("type");
      if (mode === "video" || type === "video") {
        setSelectedType("video");
      } else {
        setSelectedType("single");
      }
    }
  }, [searchParams]);

  const handleBack = () => setSelectedType(null);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 min-h-screen">
      {/* Header */}
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight flex items-center gap-3">
            <Send className="w-8 h-8 text-red-600" />
            AI Content Publisher
          </h1>
          <p className="text-slate-500 font-medium">
            {!selectedType
              ? "เลือกประเภท Post ที่ต้องการสร้าง"
              : selectedType === "single"
              ? "📸 Single Photo Post"
              : selectedType === "video"
              ? "🎬 Video Clip Post"
              : selectedType === "sequential"
              ? "📋 Sequential Posts"
              : "🖼️ Multi-Photo Album Post"}
          </p>
        </div>
      </header>

      {/* Content */}
      {!selectedType && (
        <PostTypePicker onSelect={setSelectedType} />
      )}

      {selectedType === "single" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-4">
            <button onClick={handleBack} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors">
              ← เปลี่ยนประเภท Post
            </button>
          </div>
          {connections.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-500">No social connections found. Please add them in Integrations.</p>
            </div>
          ) : (
            <SinglePostWizard connections={connections} />
          )}
        </div>
      )}

      {selectedType === "multi" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-4">
            <button onClick={handleBack} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors">
              ← เปลี่ยนประเภท Post
            </button>
          </div>
          {connections.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-500">No social connections found. Please add them in Integrations.</p>
            </div>
          ) : (
            <MultiImageWizard connections={connections} onBack={handleBack} />
          )}
        </div>
      )}

      {selectedType === "sequential" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-4">
            <button onClick={handleBack} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors">
              ← เปลี่ยนประเภท Post
            </button>
          </div>
          {connections.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-500">No social connections found. Please add them in Integrations.</p>
            </div>
          ) : (
            <SequentialPostWizard connections={connections} onBack={handleBack} />
          )}
        </div>
      )}

      {selectedType === "video" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-4">
            <button onClick={handleBack} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors">
              ← เปลี่ยนประเภท Post
            </button>
          </div>
          {connections.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-500">No social connections found. Please add them in Integrations.</p>
            </div>
          ) : (
            <SinglePostWizard connections={connections} defaultMediaType="video" />
          )}
        </div>
      )}
    </div>
  );
}

export function PublisherShell(props: any) {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" /></div>}>
      <PublisherShellInner {...props} />
    </Suspense>
  );
}

