"use client";

import React, { useState } from "react";
import { PostTypePicker } from "./PostTypePicker";
import { SinglePostWizard } from "./SinglePostWizard";
import { MultiImageWizard } from "./MultiImageWizard";
import { Send } from "lucide-react";

type PostType = "single" | "multi" | "video";
type Connection = { id: string; platform: string; accountName: string; isActive: boolean };

export function PublisherShell({ connections }: { connections: Connection[] }) {
  const [selectedType, setSelectedType] = useState<PostType | null>(null);

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
          {connections.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-500">No social connections found. Please add them in Integrations.</p>
            </div>
          ) : (
            <MultiImageWizard connections={connections} onBack={handleBack} />
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
