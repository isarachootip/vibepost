"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generateAIVideoAction,
  getCuratedVideosListAction,
} from "@/lib/actions/ai-generation";
import { Clapperboard, Loader2, Play, Check, Film, Search } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (url: string) => void;
};

type VideoItem = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  videoUrl: string;
  previewUrl: string;
};

const CATEGORIES = [
  { id: "trending", label: "🔥 ยอดฮิต" },
  { id: "business", label: "💼 ธุรกิจ/ออฟฟิศ" },
  { id: "coffee", label: "☕ คาเฟ่/ลาเต้" },
  { id: "cooking", label: "🍳 อาหาร/ห้องครัว" },
  { id: "technology", label: "💻 เทคโนโลยี/โค้ด" },
  { id: "fitness", label: "💪 สุขภาพ/ฟิตเนส" },
  { id: "travel", label: "✈️ ท่องเที่ยว/ทะเล" },
];

export function AIVideoStudioModal({ isOpen, onClose, onSelectVideo }: Props) {
  const [prompt, setPrompt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Generating (downloading and registering) states
  const [generating, setGenerating] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [previewingVideoId, setPreviewingVideoId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Load curated videos on mount
  useEffect(() => {
    async function loadVideos() {
      try {
        const res = await getCuratedVideosListAction();
        if (res.success && res.videos) {
          setVideos(res.videos);
        }
      } catch (err) {
        console.error("Failed to load curated videos", err);
      } finally {
        setLoadingList(false);
      }
    }
    loadVideos();
  }, []);

  const handleSearch = () => {
    if (!prompt.trim()) return;
    // Set category to custom if user searches via prompt
    setSelectedCategory("custom");
  };

  // Filter video list based on selected category or search prompt
  const filteredVideos = videos.filter((video) => {
    if (selectedCategory === "custom") {
      const searchTerms = prompt.toLowerCase();
      return (
        video.title.toLowerCase().includes(searchTerms) ||
        video.category.toLowerCase().includes(searchTerms) ||
        video.tags.some((tag) => tag.includes(searchTerms))
      );
    }
    if (selectedCategory === "trending") return true;
    return video.category === selectedCategory;
  });

  const handleSelectVideo = async (video: VideoItem) => {
    setGenerating(true);
    setActiveVideoId(video.id);
    setError("");

    try {
      // Prompt action to download, save to server directory and create MediaAsset
      const res = await generateAIVideoAction(video.title, video.category);
      if (res.success && res.asset) {
        onSelectVideo(res.asset.fileUrl);
        onClose();
        // Reset state
        setPrompt("");
        setActiveVideoId(null);
      } else {
        setError(res.error || "เกิดข้อผิดพลาดในการดาวน์โหลดวิดีโอลงเซิร์ฟเวอร์");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดด้านการเชื่อมต่อเครือข่าย");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl bg-white border border-slate-200 text-slate-800 shadow-2xl rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-purple-600 animate-pulse" />
            AI Video Studio
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            ค้นหาและเลือกวิดีโอคลิปประกอบแบรนด์ระดับภาพยนตร์ บันทึกลงระบบอัตโนมัติ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Search bar */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">
                ค้นหาวิดีโอด้วยคีย์เวิร์ด
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="เช่น coffee, office typing, beach, fitness..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 pl-10 pr-4 h-12 focus-visible:ring-purple-500 rounded-xl font-medium"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold h-12 px-6 rounded-xl transition-all"
            >
              ค้นหา
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id !== "custom") setPrompt("");
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/10"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Video Grid */}
          {loadingList ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
              <p className="font-semibold text-slate-500">กำลังโหลดรายการวิดีโอสต็อก...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Film className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="font-semibold text-slate-500 text-base">ไม่พบวิดีโอที่ตรงกับคีย์เวิร์ด</p>
              <p className="text-xs text-slate-400 mt-1">
                ลองใช้คีย์เวิร์ดภาษาอังกฤษ เช่น coffee, laptop, office, gym, drone
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredVideos.map((video) => {
                const isGeneratingThis = generating && activeVideoId === video.id;
                const isPreviewing = previewingVideoId === video.id;

                return (
                  <div
                    key={video.id}
                    className="border border-slate-200 bg-slate-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Video Player / Cover Preview */}
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

                      {/* Video tag overlay */}
                      <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-xs">
                        {video.category}
                      </span>

                      {/* Play/Pause loop preview trigger */}
                      <button
                        onClick={() => setPreviewingVideoId(isPreviewing ? null : video.id)}
                        className={`absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-xs ${
                          isPreviewing
                            ? "bg-purple-600/90 text-white scale-90"
                            : "bg-black/60 text-white hover:bg-black/85 hover:scale-110"
                        }`}
                      >
                        {isPreviewing ? (
                          <span className="text-[10px] font-extrabold uppercase tracking-wide">Stop</span>
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="mb-4">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-purple-600 transition-colors">
                          {video.title}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {video.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSelectVideo(video)}
                        disabled={generating}
                        className={`w-full font-bold text-xs h-10 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                          isGeneratingThis
                            ? "bg-purple-600 text-white"
                            : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                        }`}
                      >
                        {isGeneratingThis ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> กำลังดาวน์โหลดลงเครื่อง...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-purple-600" /> เลือกคลิปวิดีโอนี้
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
