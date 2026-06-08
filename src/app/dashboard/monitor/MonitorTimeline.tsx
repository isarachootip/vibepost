"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getMonitorData, MonitorChannel, MonitorPost } from "@/lib/actions/monitor";
import { syncPostInsights } from "@/lib/actions/insights";

const PLATFORMS: Record<string, { label: string; icon: string; color: string }> = {
  FACEBOOK: { label: "Facebook", icon: "📸", color: "text-blue-600 bg-blue-50 border-blue-200" },
  INSTAGRAM: { label: "Instagram", icon: "🖼️", color: "text-pink-600 bg-pink-50 border-pink-200" },
  TWITTER: { label: "Twitter", icon: "🐦", color: "text-slate-800 bg-slate-100 border-slate-200" },
  LINKEDIN: { label: "LinkedIn", icon: "💼", color: "text-sky-700 bg-sky-50 border-sky-200" },
  LINE: { label: "LINE", icon: "💬", color: "text-green-600 bg-green-50 border-green-200" },
  TIKTOK: { label: "TikTok", icon: "🎬", color: "text-slate-900 bg-slate-100 border-slate-300" },
};

const STATUS_MAP: Record<string, { label: string; bg: string; dot: string }> = {
  PUBLISHED: { label: "สำเร็จ", bg: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20", dot: "bg-emerald-500" },
  FAILED: { label: "ล้มเหลว", bg: "bg-red-500/10 text-red-700 border-red-500/20", dot: "bg-red-500" },
  SCHEDULED: { label: "มีกำหนดการ", bg: "bg-blue-500/10 text-blue-700 border-blue-500/20", dot: "bg-blue-500" },
  PUBLISHING: { label: "กำลังโพสต์", bg: "bg-amber-500/10 text-amber-700 border-amber-500/20", dot: "bg-amber-500" },
  DRAFT: { label: "ร่าง", bg: "bg-slate-500/10 text-slate-700 border-slate-500/20", dot: "bg-slate-500" },
};

function formatDate(date: Date | null | string) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(date));
}

export function MonitorTimeline({ initialWorkspaceId, workspaces }: { initialWorkspaceId?: string, workspaces?: {id: string, name: string}[] } = {}) {
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("week");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | undefined>(initialWorkspaceId);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [channels, setChannels] = useState<MonitorChannel[]>([]);
  const [posts, setPosts] = useState<MonitorPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<MonitorPost | null>(null);
  
  const [isPending, startTransition] = useTransition();

  // Helper to compute date range based on viewMode
  const getRange = (date: Date, mode: "month" | "week" | "day") => {
    const start = new Date(date);
    const end = new Date(date);
    
    if (mode === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    } else if (mode === "week") {
      // Find Monday
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }
    return { start, end };
  };

  const { start: startDate, end: endDate } = getRange(currentDate, viewMode);

  useEffect(() => {
    startTransition(async () => {
      const res = await getMonitorData(startDate.toISOString(), endDate.toISOString(), selectedWorkspaceId);
      if (res.success) {
        setChannels(res.channels || []);
        setPosts(res.posts || []);
      }
    });
  }, [currentDate, viewMode, selectedWorkspaceId]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const handleSyncInsights = async (targetId: string) => {
    setIsSyncing(targetId);
    try {
      const res = await syncPostInsights(targetId);
      if (res.success) {
        // Refetch to update UI
        const dataRes = await getMonitorData(startDate.toISOString(), endDate.toISOString(), selectedWorkspaceId);
        if (dataRes.success) {
          setPosts(dataRes.posts || []);
          if (selectedPost) {
            const updated = dataRes.posts?.find((p: any) => p.id === selectedPost.id);
            if (updated) setSelectedPost(updated);
          }
        }
      } else {
        alert("เกิดข้อผิดพลาดในการดึงสถิติ: " + res.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSyncing(null);
    }
  };

  // Generate columns based on view mode
  const columns: { label: string; subLabel: string; date: Date }[] = [];
  if (viewMode === "month") {
    const daysInMonth = endDate.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const temp = new Date(startDate);
      temp.setDate(i);
      columns.push({
        label: i.toString(),
        subLabel: temp.toLocaleDateString("th-TH", { weekday: "short" }),
        date: new Date(temp),
      });
    }
  } else if (viewMode === "week") {
    const temp = new Date(startDate);
    const dayNames = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];
    for (let i = 0; i < 7; i++) {
      columns.push({
        label: dayNames[i],
        subLabel: `${temp.getDate()} ${temp.toLocaleDateString("th-TH", { month: "short" })}`,
        date: new Date(temp),
      });
      temp.setDate(temp.getDate() + 1);
    }
  } else {
    // Hourly slots for a day
    for (let h = 0; h < 24; h += 2) {
      const timeStr = `${h.toString().padStart(2, "0")}:00`;
      columns.push({
        label: timeStr,
        subLabel: "",
        date: new Date(new Date(startDate).setHours(h, 0, 0, 0)),
      });
    }
  }

  // Filter posts that belong to a channel and date slot
  const getPostsForSlot = (channelId: string, colDate: Date) => {
    return posts.filter((post) => {
      // Must target this connection channel
      const targetsChannel = post.targetConnections.some(
        (t) => t.socialConnectionId === channelId
      );
      if (!targetsChannel) return false;

      const pDate = post.scheduledTime ? new Date(post.scheduledTime) : post.publishedTime ? new Date(post.publishedTime) : null;
      if (!pDate) return false;

      if (viewMode === "month" || viewMode === "week") {
        return (
          pDate.getDate() === colDate.getDate() &&
          pDate.getMonth() === colDate.getMonth() &&
          pDate.getFullYear() === colDate.getFullYear()
        );
      } else {
        // Hour slot (2-hour range)
        const postHour = pDate.getHours();
        const colHour = colDate.getHours();
        return postHour >= colHour && postHour < colHour + 2;
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Toolbar / Controls ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="text-sm font-black text-slate-800 tracking-tight min-w-[160px] text-center">
            {viewMode === "month" ? (
              currentDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" })
            ) : viewMode === "week" ? (
              <>
                {startDate.getDate()} {startDate.toLocaleDateString("th-TH", { month: "short", year: "numeric" })} - {endDate.getDate()} {endDate.toLocaleDateString("th-TH", { month: "short", year: "numeric" })}
              </>
            ) : (
              currentDate.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
            )}
          </span>
          <button
            onClick={handleNext}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-colors"
          >
            วันนี้
          </button>
        </div>

        <div className="flex items-center gap-2">
          {workspaces && workspaces.length > 0 && (
            <select
              value={selectedWorkspaceId || ""}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent mr-2"
            >
              <option value="" disabled>เลือก Workspace</option>
              {workspaces.map(ws => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setViewMode("month")}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              viewMode === "month"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            รายเดือน
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              viewMode === "week"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            รายสัปดาห์
          </button>
          <button
            onClick={() => setViewMode("day")}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              viewMode === "day"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            รายวัน
          </button>
        </div>
      </div>

      {/* ── Timeline Grid ── */}
      {isPending ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-24 text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 text-sm font-semibold">กำลังดึงข้อมูลปฏิทินโพสต์...</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-24 text-center">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-slate-900 font-bold text-lg mb-2">ไม่มีช่องทาง Social ใน Workspace นี้</h3>
          <p className="text-slate-500 text-sm">เชื่อมต่อ Facebook หรือแพลตฟอร์มอื่นๆ ในหน้า Integrations เพื่อเริ่มใช้งาน</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${Math.max(800, columns.length * 160 + 256)}px` }}>
              {/* Header Row */}
              <div className="flex border-b border-slate-200 bg-slate-50/50">
                <div className="w-64 p-4 font-black text-slate-800 text-xs uppercase tracking-wider border-r border-slate-200 shrink-0">
                  ช่องทางสื่อสังคมออนไลน์
                </div>
                <div className="flex flex-1">
                  {columns.map((col, idx) => (
                    <div
                      key={idx}
                      className="flex-1 min-w-[160px] p-3 text-center border-r border-slate-200/60 last:border-r-0 shrink-0"
                    >
                      <span className="block text-slate-800 text-xs font-black">{col.label}</span>
                      {col.subLabel && (
                        <span className="block text-slate-400 text-[10px] font-semibold mt-0.5">{col.subLabel}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel Rows */}
              <div className="divide-y divide-slate-200">
                {channels.map((chan) => {
                  const plat = PLATFORMS[chan.platform] || { label: chan.platform, icon: "🔗", color: "text-slate-600 bg-slate-50" };
                  return (
                    <div key={chan.id} className="flex min-h-[100px]">
                      {/* Channel Card Left */}
                      <div className="w-64 p-4 border-r border-slate-200 flex items-center gap-3 shrink-0 bg-slate-50/20">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 font-bold border ${plat.color} shadow-sm`}>
                          {plat.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate">{chan.accountName}</p>
                          <p className="text-xs text-slate-400 font-semibold">{plat.label}</p>
                        </div>
                      </div>

                      {/* Timeline Cells Right */}
                      <div className="flex flex-1 relative">
                        {columns.map((col, idx) => {
                          const slotPosts = getPostsForSlot(chan.id, col.date);
                          return (
                            <div
                              key={idx}
                              className="flex-1 min-w-[160px] p-2 border-r border-slate-200/60 last:border-r-0 min-h-[100px] flex flex-col gap-2 bg-white hover:bg-slate-50/20 transition-colors shrink-0"
                            >
                              {slotPosts.map((post) => {
                                const status = STATUS_MAP[post.status] || { label: post.status, bg: "bg-slate-100 text-slate-700", dot: "bg-slate-400" };
                                const time = post.scheduledTime ? new Date(post.scheduledTime) : post.publishedTime ? new Date(post.publishedTime) : null;
                                return (
                                  <button
                                    key={post.id}
                                    onClick={() => setSelectedPost(post)}
                                    className={`w-full text-left p-2 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${status.bg} cursor-pointer group`}
                                  >
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className="text-[10px] font-black uppercase font-mono">
                                        {time ? time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "—"}
                                      </span>
                                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700 line-clamp-2 leading-snug group-hover:text-slate-900">
                                      {post.content || <span className="italic text-slate-400">ไม่มีข้อความ</span>}
                                    </p>
                                    {post.images.length > 0 && (
                                      <div className="mt-1.5 w-full h-8 rounded-lg overflow-hidden border border-slate-200/50 bg-slate-50">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={post.images[0].url}
                                          alt="Preview"
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                        />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {selectedPost && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-800">รายละเอียดโพสต์</h3>
                <span className="text-xs font-semibold text-slate-400">
                  มีกำหนดการ/โพสต์: {formatDate(selectedPost.scheduledTime || selectedPost.publishedTime)}
                </span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Content Caption */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">ข้อความบรรยาย (Caption)</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedPost.content || <span className="italic text-slate-400">ไม่มีข้อความบรรยาย</span>}
                </div>
              </div>

              {/* Media Preview */}
              {selectedPost.images.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">สื่อแนบ (Media)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedPost.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt="Post media"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status details */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">สถานะแต่ละช่องทาง</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {selectedPost.targetConnections.map((t, idx) => {
                    const status = STATUS_MAP[t.status] || { label: t.status, bg: "bg-slate-100 text-slate-700", dot: "bg-slate-400" };
                    const chan = channels.find((c) => c.id === t.socialConnectionId);
                    const plat = chan ? PLATFORMS[chan.platform] : null;
                    return (
                      <div key={idx} className="p-4 flex flex-col gap-3 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{plat?.icon || "🔗"}</span>
                            <div>
                              <p className="text-sm font-black text-slate-800">{chan?.accountName || "Unknown Channel"}</p>
                              <p className="text-xs text-slate-400 font-semibold">{plat?.label || "Social"}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>
                            {t.errorMessage && (
                              <span className="text-[10px] text-red-500 font-medium max-w-[200px] truncate" title={t.errorMessage}>
                                {t.errorMessage}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Insights Stats */}
                        {t.status === "PUBLISHED" && (
                          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 mt-2 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                                </div>
                                <span className="text-sm font-black text-slate-800 tracking-tight">ประสิทธิภาพ (Insights)</span>
                              </div>
                              {["Facebook", "Instagram", "TikTok"].includes(plat?.label || "") && (
                                <button 
                                  onClick={() => handleSyncInsights(t.id)}
                                  disabled={isSyncing === t.id}
                                  className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 transition-all disabled:opacity-50 shadow-sm"
                                >
                                  {isSyncing === t.id ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                      กำลังซิงค์...
                                    </>
                                  ) : (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                                      ซิงค์สถิติ
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Reach</span>
                                </div>
                                <span className="block text-xl font-black text-slate-900 tracking-tight">{(t.reach || 0).toLocaleString()}</span>
                              </div>
                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Engagement</span>
                                </div>
                                <span className="block text-xl font-black text-slate-900 tracking-tight">{(t.engagement || 0).toLocaleString()}</span>
                              </div>
                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Impressions</span>
                                </div>
                                <span className="block text-xl font-black text-slate-900 tracking-tight">{(t.impressions || 0).toLocaleString()}</span>
                              </div>
                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clicks</span>
                                </div>
                                <span className="block text-xl font-black text-slate-900 tracking-tight">{(t.clicks || 0).toLocaleString()}</span>
                              </div>
                            </div>
                            
                            {t.insightsSyncedAt && (
                              <div className="flex items-center justify-end gap-1.5 mt-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                <p className="text-[10px] text-slate-400 font-semibold">
                                  อัปเดตล่าสุด: {new Date(t.insightsSyncedAt).toLocaleString('th-TH')}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
