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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  CalendarIcon,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  Share2,
  Film,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Zap,
  Globe,
} from "lucide-react";
import { createScheduledPost } from "@/lib/actions/posts";

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

  // Date and Time state
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  const [scheduleHour, setScheduleHour] = useState(
    String(new Date().getHours()).padStart(2, "0")
  );
  const [scheduleMinute, setScheduleMinute] = useState("00");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [scheduledResultTime, setScheduledResultTime] = useState<Date | null>(null);

  // Sync content and select active channels on open
  useEffect(() => {
    if (isOpen) {
      setPostContent(content);
      setError("");
      setSuccess(false);
      if (connections.length > 0) {
        setSelectedChannels(connections.filter((c) => c.isActive).map((c) => c.id));
      }
    }
  }, [isOpen, content, connections]);

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
      let targetDate: Date;
      if (publishMode === "instant") {
        targetDate = new Date();
      } else {
        targetDate = scheduleDate ? new Date(scheduleDate) : new Date();
        targetDate.setHours(parseInt(scheduleHour), parseInt(scheduleMinute), 0, 0);
      }

      const res = await createScheduledPost({
        content: postContent,
        scheduledTime: targetDate,
        targetConnectionIds: selectedChannels,
        imageUrl: mediaUrl || undefined,
      });

      if (res.success) {
        setSuccess(true);
        setScheduledResultTime(targetDate);
      } else {
        setError(res.error || "เกิดข้อผิดพลาดในการบันทึกโพสต์");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  ตั้งค่า Auto-Post & เผยแพร่ทันที
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                  เชื่อมโยงบทความและสื่อจาก AI Studio ส่งเข้าสู่ระบบ Auto-Publisher ได้ในคลิกเดียว
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {success ? (
          <div className="py-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 space-y-5">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-black text-slate-900">
                {publishMode === "instant"
                  ? "ส่งคำขอเผยแพร่เรียบร้อย! 🚀"
                  : "ตั้งเวลา Auto-Post สำเร็จ! ⏰"}
              </h3>
              {scheduledResultTime && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700">
                  <span className="text-slate-400 block mb-1">กำหนดส่งออกในวันที่</span>
                  <span className="text-sm font-black text-purple-700">
                    {format(scheduledResultTime, "EEEE d MMMM yyyy", { locale: th })} เวลา{" "}
                    {format(scheduledResultTime, "HH:mm")} น.
                  </span>
                </div>
              )}
              <p className="text-xs text-slate-500 leading-relaxed">
                ระบบ Auto-Publisher จะทำการดีพลอยโพสต์ของคุณไปยังช่องทางโซเชียลมีเดียที่เลือกไว้โดยอัตโนมัติ
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/history")}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl h-11 px-5"
              >
                📊 ดูประวัติโพสต์ (Post History)
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/monitor")}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl h-11 px-5"
              >
                📡 ตรวจสอบคิว (Post Monitor)
              </Button>
              <Button
                onClick={onClose}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl h-11 px-6 shadow-md"
              >
                ✨ สร้างเนื้อหาต่อ
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Social Feed Preview (col-span 6) */}
              <div className="lg:col-span-6 space-y-3">
                <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block">
                  ตัวอย่างโพสต์บนหน้าฟีด (Preview & Fine-tune)
                </Label>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-inner">
                  {/* Feed mock header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      VP
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {connections.length > 0
                          ? connections.find((c) => selectedChannels.includes(c.id))?.accountName || "Vibe Post Feed"
                          : "Vibe Post Feed"}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                        <span>Just now</span>
                        <span>•</span>
                        <Globe className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>

                  {/* Caption Editor */}
                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full bg-white border-slate-200 text-slate-800 text-xs leading-relaxed min-h-[140px] max-h-[220px] rounded-xl focus-visible:ring-purple-500 shadow-xs"
                    placeholder="พิมพ์หรือแก้ไขข้อความแคปชัน..."
                  />

                  {/* Media Preview */}
                  {mediaUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video w-full bg-black relative shadow-xs">
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
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        {mediaType === "video" ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {mediaType === "video" ? "วิดีโอ AI" : "รูปภาพ AI"}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs font-medium">
                      ไม่มีไฟล์สื่อแนบ (จะโพสต์เฉพาะข้อความ)
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Publishing Controls (col-span 6) */}
              <div className="lg:col-span-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Channel Selection */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                        1. เลือกช่องทางโซเชียล (Target Channels)
                      </Label>
                      {connections.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSelectAllChannels}
                          className="text-[11px] font-bold text-purple-600 hover:text-purple-800 underline"
                        >
                          {selectedChannels.length === connections.length ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                        </button>
                      )}
                    </div>

                    {connections.length === 0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
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
                                  ? "border-purple-600 bg-purple-50/60 text-purple-950 font-bold shadow-xs ring-1 ring-purple-600/20"
                                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                  {conn.platform}
                                </span>
                                <span className="truncate block">{conn.accountName}</span>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 text-[10px] font-black ${
                                  isChecked
                                    ? "bg-purple-600 border-purple-600 text-white"
                                    : "border-slate-300 bg-white text-transparent"
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
                    <Label className="text-xs font-black text-slate-600 uppercase tracking-wider block">
                      2. เลือกรูปแบบการเผยแพร่ (Publishing Mode)
                    </Label>

                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPublishMode("instant")}
                        className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                          publishMode === "instant"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> โพสต์ทันที (Post Now)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPublishMode("scheduled")}
                        className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                          publishMode === "scheduled"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <CalendarIcon className="w-3.5 h-3.5 text-purple-600" /> ตั้งเวลา Auto-Post
                      </button>
                    </div>

                    {/* Schedule Date & Time Controls */}
                    {publishMode === "scheduled" && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                              📆 วันที่ต้องการส่ง
                            </label>
                            <Popover>
                              <PopoverTrigger
                                className="w-full justify-start text-left font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-3 text-xs inline-flex items-center shadow-xs"
                              >
                                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                                {scheduleDate ? (
                                  format(scheduleDate, "d MMM yyyy", { locale: th })
                                ) : (
                                  <span>เลือกวันที่</span>
                                )}
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-white border-slate-200 text-slate-800 shadow-xl rounded-2xl">
                                <Calendar
                                  mode="single"
                                  selected={scheduleDate}
                                  onSelect={setScheduleDate}
                                  disabled={{ before: new Date() }}
                                  className="bg-white text-slate-800 rounded-2xl"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
                              🕐 เวลาที่โพสต์
                            </label>
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 h-10 shadow-xs">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <select
                                value={scheduleHour}
                                onChange={(e) => setScheduleHour(e.target.value)}
                                className="bg-transparent text-slate-700 font-bold text-xs focus:outline-none flex-1"
                              >
                                {Array.from({ length: 24 }, (_, i) =>
                                  String(i).padStart(2, "0")
                                ).map((h) => (
                                  <option key={h} value={h}>
                                    {h}
                                  </option>
                                ))}
                              </select>
                              <span className="text-slate-400 font-bold text-xs">:</span>
                              <select
                                value={scheduleMinute}
                                onChange={(e) => setScheduleMinute(e.target.value)}
                                className="bg-transparent text-slate-700 font-bold text-xs focus:outline-none flex-1"
                              >
                                {["00", "15", "30", "45"].map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {scheduleDate && (
                          <div className="text-[11px] text-purple-700 bg-purple-50/70 border border-purple-100 rounded-xl p-2.5 font-semibold">
                            📌 โพสต์จะถูกเผยแพร่อัตโนมัติวันที่{" "}
                            <span className="font-black text-purple-900">
                              {format(scheduleDate, "EEEE d MMMM yyyy", { locale: th })}
                            </span>{" "}
                            เวลา{" "}
                            <span className="font-black text-purple-900">
                              {scheduleHour}:{scheduleMinute} น.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onOpenAdvancedWizard}
                    className="text-xs font-bold text-slate-500 hover:text-purple-600 flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> เปิดใน AI Publisher (ขั้นสูง)
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl h-11 px-4 flex-1 sm:flex-none"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || connections.length === 0}
                      className="bg-gradient-to-r from-purple-600 via-indigo-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white text-xs font-black rounded-xl h-11 px-6 shadow-md flex-1 sm:flex-none flex items-center justify-center gap-2"
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
