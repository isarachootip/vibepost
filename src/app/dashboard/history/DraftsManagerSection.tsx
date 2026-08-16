"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DraftPostItem, movePostToTrash, publishDraftPostAction } from "@/lib/actions/posts";
import { StudioAutoPostModal } from "../ai-studio/StudioAutoPostModal";
import {
  Sparkles,
  Rocket,
  Trash2,
  Calendar,
  Clock,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  FileEdit,
  PlusCircle,
  Eye,
  Layers,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type Connection = {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
};

type Props = {
  initialDrafts: DraftPostItem[];
  connections: Connection[];
};

export function DraftsManagerSection({ initialDrafts, connections }: Props) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftPostItem[]>(initialDrafts);
  const [selectedDraft, setSelectedDraft] = useState<DraftPostItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenConfigure = (draft: DraftPostItem) => {
    setSelectedDraft(draft);
    setIsModalOpen(true);
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm("คุณต้องการย้ายแบบร่างนี้ไปที่ถังขยะใช่หรือไม่?")) return;
    setDeletingId(id);
    try {
      const res = await movePostToTrash(id);
      if (res.success) {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
        router.refresh();
      } else {
        alert(res.error || "ไม่สามารถลบแบบร่างได้");
      }
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenAdvancedWizard = (draft: DraftPostItem) => {
    if (typeof window !== "undefined") {
      try {
        const media = draft.media?.[0];
        sessionStorage.setItem(
          "vibepost_studio_preset",
          JSON.stringify({
            text: draft.content,
            mediaUrl: media?.url || "",
            mediaType: media?.fileType === "VIDEO" ? "video" : "image",
            mode: media?.fileType === "VIDEO" ? "video" : "single",
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.error("Error setting draft preset", e);
      }
    }
    router.push("/dashboard/multi-post?preset=studio");
  };

  if (drafts.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-4 my-6">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl mx-auto flex items-center justify-center border border-purple-100 shadow-inner">
          <Layers className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-800">ยังไม่มีแบบร่างที่รอโพสต์ (Drafts Queue)</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            คุณสามารถไปที่ห้อง AI Studio หรือ AI Caption เพื่อสร้างแคปชันและเจนรูปภาพตุนไว้ล่วงหน้า จากนั้นกดปุ่ม <strong>"บันทึกเป็นแบบร่าง"</strong> เพื่อนำมารอตั้งค่าโพสต์ที่นี่ได้ทุกเมื่อ
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Button
            onClick={() => router.push("/dashboard/ai-studio")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-11 px-5 rounded-xl shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> ไปสร้างเนื้อหาที่ AI Studio
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/ai-caption")}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs h-11 px-5 rounded-xl"
          >
            ไปที่ AI Caption
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" /> คลังแบบร่างรอโพสต์ (Staged Drafts)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            รายการคอนเทนต์ที่สร้างตุนไว้ล่วงหน้า คลิกปุ่ม <strong>"ตั้งค่า & สั่งโพสต์"</strong> เพื่อกำหนดเวลาเผยแพร่ได้ทันที
          </p>
        </div>
        <span className="text-xs font-black text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full shadow-xs">
          รอโพสต์ {drafts.length} รายการ
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drafts.map((draft) => {
          const firstMedia = draft.media?.[0];
          return (
            <div
              key={draft.id}
              className="bg-white border border-slate-200 hover:border-purple-300 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Media Thumbnail */}
                {firstMedia ? (
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden border-b border-slate-100">
                    {firstMedia.fileType === "VIDEO" ? (
                      <video
                        src={firstMedia.url}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                        muted
                      />
                    ) : (
                      <img
                        src={firstMedia.url}
                        alt="Draft visual"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                      {firstMedia.fileType === "VIDEO" ? (
                        <Film className="w-3 h-3 text-indigo-400" />
                      ) : (
                        <ImageIcon className="w-3 h-3 text-purple-400" />
                      )}
                      <span>{firstMedia.fileType === "VIDEO" ? "วิดีโอ" : "รูปภาพ"}</span>
                    </div>

                    <div className="absolute bottom-2 right-2 text-[10px] text-white/80 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md font-medium">
                      {format(new Date(draft.createdAt), "d MMM yyyy, HH:mm", { locale: th })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-slate-500">📝 ข้อความแคปชัน (ไม่มีสื่อ)</span>
                    <span className="text-[10px]">
                      {format(new Date(draft.createdAt), "d MMM yyyy", { locale: th })}
                    </span>
                  </div>
                )}

                {/* Content snippet */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-4 whitespace-pre-wrap font-sans">
                    {draft.content}
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {draft.content.length} ตัวอักษร
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deletingId === draft.id}
                  onClick={() => handleDeleteDraft(draft.id)}
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs h-9 px-2.5 rounded-xl transition-colors"
                  title="ลบแบบร่าง"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenAdvancedWizard(draft)}
                    className="border-slate-200 text-slate-600 hover:bg-white text-xs h-9 px-3 rounded-xl font-bold"
                  >
                    <FileEdit className="w-3.5 h-3.5 mr-1 text-slate-400" /> แก้ไข
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleOpenConfigure(draft)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs h-9 px-4 rounded-xl shadow-xs hover:shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Rocket className="w-3.5 h-3.5 text-yellow-300" /> ตั้งค่า & สั่งโพสต์
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AutoPost Modal for Selected Draft */}
      {selectedDraft && (
        <StudioAutoPostModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDraft(null);
            router.refresh();
          }}
          content={selectedDraft.content}
          mediaUrl={selectedDraft.media?.[0]?.url || null}
          mediaType={selectedDraft.media?.[0]?.fileType === "VIDEO" ? "video" : "image"}
          connections={connections}
          onOpenAdvancedWizard={() => {
            setIsModalOpen(false);
            handleOpenAdvancedWizard(selectedDraft);
          }}
        />
      )}
    </div>
  );
}
