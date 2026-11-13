"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DraftPostItem, movePostToTrash } from "@/lib/actions/posts";
import { StudioAutoPostModal } from "../ai-studio/StudioAutoPostModal";
import { DraftCard } from "./DraftCard";
import { Layers, Sparkles } from "lucide-react";

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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
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
      <div className="neu-raised neu-mesh-card neu-grain rounded-3xl p-10 md:p-12 text-center max-w-2xl mx-auto space-y-4 my-6">
        <div className="w-16 h-16 neu-tint-primary rounded-3xl mx-auto flex items-center justify-center">
          <Layers className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-display text-xl font-bold text-foreground">
            ยังไม่มีแบบร่างที่รอโพสต์ (Drafts Queue)
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            คุณสามารถไปที่ห้อง AI Studio หรือ AI Caption เพื่อสร้างแคปชันและเจนรูปภาพตุนไว้ล่วงหน้า จากนั้นกดปุ่ม{" "}
            <strong className="text-foreground">&ldquo;บันทึกเป็นแบบร่าง&rdquo;</strong> เพื่อนำมารอตั้งค่าโพสต์ที่นี่ได้ทุกเมื่อ
          </p>
        </div>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Button
            variant="tactile"
            onClick={() => router.push("/dashboard/ai-studio")}
            className="font-bold text-xs h-11 px-5 rounded-xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> ไปสร้างเนื้อหาที่ AI Studio
          </Button>
          <Button
            variant="neu"
            onClick={() => router.push("/dashboard/ai-caption")}
            className="font-bold text-xs h-11 px-5 rounded-xl"
          >
            ไปที่ AI Caption
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> คลังแบบร่างรอโพสต์ (Staged Drafts)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            รายการคอนเทนต์ที่สร้างตุนไว้ล่วงหน้า คลิกปุ่ม{" "}
            <strong className="text-foreground">&ldquo;ตั้งค่า &amp; สั่งโพสต์&rdquo;</strong>{" "}
            เพื่อกำหนดเวลาเผยแพร่ได้ทันที
          </p>
        </div>
        <span className="text-xs font-bold neu-tint-primary px-3.5 py-1.5 rounded-full">
          รอโพสต์ {drafts.length} รายการ
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drafts.map((draft) => (
          <DraftCard
            key={draft.id}
            draft={draft}
            isDeleting={deletingId === draft.id}
            onDelete={handleDeleteDraft}
            onEdit={handleOpenAdvancedWizard}
            onConfigure={handleOpenConfigure}
          />
        ))}
      </div>

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
