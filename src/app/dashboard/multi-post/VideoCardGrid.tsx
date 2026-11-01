"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Film, Loader2, Play } from "lucide-react";

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  videoUrl: string;
  previewUrl: string;
}

interface VideoCardGridProps {
  loadingList: boolean;
  videos: VideoItem[];
  generating: boolean;
  activeVideoId: string | null;
  previewingVideoId: string | null;
  onTogglePreview: (videoId: string) => void;
  onSelectVideoItem: (video: VideoItem) => void;
}

export function VideoCardGrid({
  loadingList,
  videos,
  generating,
  activeVideoId,
  previewingVideoId,
  onTogglePreview,
  onSelectVideoItem,
}: VideoCardGridProps) {
  if (loadingList) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
        <p className="font-semibold text-slate-500 text-sm">กำลังโหลดรายการวิดีโอ...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-14 text-slate-400">
        <Film className="w-14 h-14 text-slate-300 mx-auto mb-3" />
        <p className="font-semibold text-slate-500 text-sm">ไม่พบวิดีโอสต็อกที่ตรงกับคำค้น</p>
        <p className="text-xs text-slate-400 mt-1">
          สามารถกดปุ่ม &ldquo;เจนวิดีโอ AI จาก Prompt&rdquo; ด้านบน หรือลองคีย์เวิร์ดเช่น travel, beach, coffee, office
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {videos.map((video) => {
        const isGeneratingThis = generating && activeVideoId === video.id;
        const isPreviewing = previewingVideoId === video.id;

        return (
          <div
            key={video.id}
            className="border border-slate-200 bg-slate-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
          >
            <div className="relative aspect-video w-full bg-black overflow-hidden border-b border-slate-100">
              {isPreviewing ? (
                <video
                  src={video.videoUrl}
                  className="w-full h-full object-cover"
                  controls={false}
                  loop
                  muted
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={video.previewUrl}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              <span className="absolute bottom-2.5 left-2.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                {video.category}
              </span>

              <button
                type="button"
                onClick={() => onTogglePreview(video.id)}
                className={`absolute inset-0 m-auto w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isPreviewing
                    ? "bg-purple-600/90 text-white scale-90"
                    : "bg-black/60 text-white hover:bg-black/85 hover:scale-110"
                }`}
              >
                {isPreviewing ? (
                  <span className="text-[10px] font-extrabold uppercase">Stop</span>
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div className="mb-3">
                <h4 className="font-bold text-slate-800 text-xs line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {video.title}
                </h4>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {video.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                onClick={() => onSelectVideoItem(video)}
                disabled={generating}
                className={`w-full font-bold text-xs h-9 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                  isGeneratingThis
                    ? "bg-purple-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                }`}
              >
                {isGeneratingThis ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> กำลังดาวน์โหลด...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-purple-600" /> เลือกคลิปวิดีโอนี้
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
