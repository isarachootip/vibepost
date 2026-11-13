"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  CalendarIcon,
  Send,
  CheckCircle2,
  Film,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Zap,
  Globe,
} from "lucide-react";
import { createScheduledPost } from "@/lib/actions/posts";
import { useFutureSchedule } from "@/hooks/use-future-schedule";
import { ScheduleDateTimePicker } from "@/components/scheduling/ScheduleDateTimePicker";

type Connection = {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  mediaUrl: string | null;
  mediaType: "image" | "video";
  connections: Connection[];
  onOpenAdvancedWizard: () => void;
};

export function StudioAutoPostModal({
  isOpen,
  onClose,
  content,
  mediaUrl,
  mediaType,
  connections,
  onOpenAdvancedWizard,
}: Props) {
  const router = useRouter();

  const [postContent, setPostContent] = useState(content);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [publishMode, setPublishMode] = useState<"instant" | "scheduled">("instant");

  const schedule = useFutureSchedule();
  const { resetSchedule } = schedule;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [scheduledResultTime, setScheduledResultTime] = useState<Date | null>(null);

  // Sync content, refresh future schedule slot, and select active channels on open
  useEffect(() => {
    if (isOpen) {
      setPostContent(content);
      setError("");
      setSuccess(false);
      resetSchedule();
      if (connections.length > 0) {
        setSelectedChannels(connections.filter((c) => c.isActive).map((c) => c.id));
      }
    }
  }, [isOpen, content, connections, resetSchedule]);

  const toggleChannel = (id: string) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSelectAllChannels = () => {
    if (selectedChannels.length === connections.length) {
      setSelectedChannels([]);
    } else {
      setSelectedChannels(connections.map((c) => c.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedChannels.length === 0) {
      setError("กรุณาเลือกช่องทางโซเชียลอย่างน้อย 1 ช่องทาง");
      return;
    }
    if (!postContent.trim()) {
      setError("เนื้อหาโพสต์ต้องไม่ว่างเปล่า");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const isInstant = publishMode === "instant";
      const targetDate = isInstant ? new Date() : schedule.getScheduledDate();

      const res = await createScheduledPost({
        content: postContent,
        scheduledTime: isInstant ? null : targetDate,
        publishMode: isInstant ? "NOW" : "SCHEDULE",
        targetConnectionIds: selectedChannels,
        imageUrl: mediaUrl || undefined,
      });

      if (res.success) {
        setSuccess(true);
        setScheduledResultTime(targetDate);
      } else {
        setError(res.error || "เกิดข้อผิดพลาดในการบันทึกโพสต์");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 md:p-8">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl neu-tint-primary flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-display text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                  ตั้งค่า Auto-Post &amp; เผยแพร่ทันที
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-medium mt-0.5">
                  เชื่อมโยงบทความและสื่อจาก AI Studio ส่งเข้าสู่ระบบ Auto-Publisher ได้ในคลิกเดียว
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {success ? (
          <div className="py-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 space-y-5">
            <div className="w-20 h-20 bg-emerald-500/12 rounded-full flex items-center justify-center border-4 border-emerald-500/25">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="font-display text-2xl font-extrabold text-foreground">
                {publishMode === "instant"
                  ? "ส่งคำขอเผยแพร่เรียบร้อย! 🚀"
                  : "ตั้งเวลา Auto-Post สำเร็จ! ⏰"}
              </h3>
              {scheduledResultTime && (
                <div className="p-4 neu-pressed rounded-2xl text-xs font-semibold text-foreground/85">
                  <span className="text-muted-foreground block mb-1">กำหนดส่งออกในวันที่</span>
                  <span className="text-sm font-extrabold text-primary">
                    {format(scheduledResultTime, "EEEE d MMMM yyyy", { locale: th })} เวลา{" "}
                    {format(scheduledResultTime, "HH:mm")} น.
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed">
                ระบบ Auto-Publisher จะทำการดีพลอยโพสต์ของคุณไปยังช่องทางโซเชียลมีเดียที่เลือกไว้โดยอัตโนมัติ
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button
                variant="neu"
                onClick={() => router.push("/dashboard/history")}
                className="font-bold text-xs rounded-xl h-11 px-5"
              >
                📊 ดูประวัติโพสต์ (Post History)
              </Button>
              <Button
                variant="neu"
                onClick={() => router.push("/dashboard/monitor")}
                className="font-bold text-xs rounded-xl h-11 px-5"
              >
                📡 ตรวจสอบคิว (Post Monitor)
              </Button>
              <Button
                variant="tactile"
                onClick={onClose}
                className="font-bold text-xs rounded-xl h-11 px-6"
              >
                ✨ สร้างเนื้อหาต่อ
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {error && (
              <div className="p-3.5 bg-destructive/12 border border-destructive/30 text-destructive rounded-xl text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Social Feed Preview */}
              <div className="lg:col-span-6 space-y-3">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  ตัวอย่างโพสต์บนหน้าฟีด (Preview &amp; Fine-tune)
                </Label>

                <div className="neu-pressed rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-extrabold text-xs flex items-center justify-center shadow-xs">
                      VP
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        {connections.length > 0
                          ? connections.find((c) => selectedChannels.includes(c.id))?.accountName || "Vibe Post Feed"
                          : "Vibe Post Feed"}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                        <span>Just now</span>
                        <span>•</span>
                        <Globe className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>

                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full text-xs leading-relaxed min-h-[140px] max-h-[220px] rounded-xl"
                    placeholder="พิมพ์หรือแก้ไขข้อความแคปชัน..."
                  />

                  {mediaUrl ? (
                    <div className="rounded-xl overflow-hidden border border-border/60 aspect-video w-full bg-black relative shadow-xs">
                      {mediaType === "video" ? (
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-contain"
                          controls
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt="Post media visual"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        {mediaType === "video" ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {mediaType === "video" ? "วิดีโอ AI" : "รูปภาพ AI"}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-border/70 bg-[var(--surface-elevated)]/40 rounded-xl text-center text-muted-foreground text-xs font-medium">
                      ไม่มีไฟล์สื่อแนบ (จะโพสต์เฉพาะข้อความ)
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Publishing Controls */}
              <div className="lg:col-span-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Channel Selection */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        1. เลือกช่องทางโซเชียล (Target Channels)
                      </Label>
                      {connections.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSelectAllChannels}
                          className="text-[11px] font-bold text-primary hover:underline"
                        >
                          {selectedChannels.length === connections.length ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                        </button>
                      )}
                    </div>

                    {connections.length === 0 ? (
                      <div className="p-4 bg-amber-500/12 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                        ยังไม่มีการเชื่อมต่อโซเชียลมีเดีย กรุณาไปที่หน้า{" "}
                        <a href="/dashboard/social" className="font-bold underline">
                          Integrations
                        </a>{" "}
                        เพื่อผูก Facebook หรือ Instagram ก่อน
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {connections.map((conn) => {
                          const isChecked = selectedChannels.includes(conn.id);
                          return (
                            <button
                              key={conn.id}
                              type="button"
                              onClick={() => toggleChannel(conn.id)}
                              className={`p-3 rounded-xl border text-left transition-all text-xs flex items-center justify-between gap-2 ${
                                isChecked
                                  ? "neu-tint-primary font-bold"
                                  : "neu-pressed border-border/60 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                  {conn.platform}
                                </span>
                                <span className="truncate block text-foreground">{conn.accountName}</span>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 text-[10px] font-black ${
                                  isChecked
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-border bg-[var(--surface-recessed)] text-transparent"
                                }`}
                              >
                                ✓
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Publishing Mode Tabs */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      2. เลือกรูปแบบการเผยแพร่ (Publishing Mode)
                    </Label>

                    <div className="grid grid-cols-2 gap-1.5 neu-pressed p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPublishMode("instant")}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          publishMode === "instant"
                            ? "bg-[var(--surface-elevated)] text-foreground shadow-sm border border-border/70"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> โพสต์ทันที (Post Now)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPublishMode("scheduled")}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          publishMode === "scheduled"
                            ? "bg-[var(--surface-elevated)] text-foreground shadow-sm border border-border/70"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <CalendarIcon className="w-3.5 h-3.5 text-primary" /> ตั้งเวลา Auto-Post
                      </button>
                    </div>

                    {publishMode === "scheduled" && (
                      <div className="p-4 neu-pressed rounded-2xl animate-in fade-in">
                        <ScheduleDateTimePicker
                          schedule={schedule}
                          accentColor="purple"
                          compact
                          dateLabel="📆 วันที่ต้องการส่ง"
                          timeLabel="🕐 เวลาที่โพสต์"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onOpenAdvancedWizard}
                    className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> เปิดใน AI Publisher (ขั้นสูง)
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="neu"
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="text-xs font-bold rounded-xl h-11 px-4 flex-1 sm:flex-none"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      variant="tactile"
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || connections.length === 0}
                      className="text-xs font-bold rounded-xl h-11 px-6 flex-1 sm:flex-none flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึกโพสต์...
                        </>
                      ) : publishMode === "instant" ? (
                        <>
                          <Zap className="w-4 h-4" /> ยืนยันโพสต์ทันที
                        </>
                      ) : (
                        <>
                          <CalendarIcon className="w-4 h-4" /> ยืนยันตั้งเวลา Auto-Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
