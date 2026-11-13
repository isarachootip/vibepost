"use client";

import React, { useEffect, useState, useTransition } from "react";
import { getMonitorData, MonitorChannel, MonitorPost } from "@/lib/actions/monitor";
import { syncPostInsights } from "@/lib/actions/insights";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildMonitorColumns,
  getMonitorDateRange,
  getPostsForMonitorSlot,
  MONITOR_PLATFORMS,
  MONITOR_STATUS_MAP,
  MonitorViewMode,
} from "./monitor-helpers";
import { MonitorPostModal } from "./MonitorPostModal";

export function MonitorTimeline({
  initialWorkspaceId,
  workspaces,
}: {
  initialWorkspaceId?: string;
  workspaces?: { id: string; name: string }[];
} = {}) {
  const [viewMode, setViewMode] = useState<MonitorViewMode>("week");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | undefined>(
    initialWorkspaceId
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [channels, setChannels] = useState<MonitorChannel[]>([]);
  const [posts, setPosts] = useState<MonitorPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<MonitorPost | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { start: startDate, end: endDate } = getMonitorDateRange(currentDate, viewMode);

  useEffect(() => {
    const { start, end } = getMonitorDateRange(currentDate, viewMode);
    startTransition(async () => {
      const res = await getMonitorData(
        start.toISOString(),
        end.toISOString(),
        selectedWorkspaceId
      );
      if (res.success) {
        setChannels(res.channels || []);
        setPosts(res.posts || []);
      }
    });
  }, [currentDate, viewMode, selectedWorkspaceId]);

  const shiftPeriod = (direction: -1 | 1) => {
    const next = new Date(currentDate);
    if (viewMode === "month") next.setMonth(currentDate.getMonth() + direction);
    else if (viewMode === "week") next.setDate(currentDate.getDate() + 7 * direction);
    else next.setDate(currentDate.getDate() + direction);
    setCurrentDate(next);
  };

  const handleSyncInsights = async (targetId: string) => {
    setIsSyncing(targetId);
    try {
      const res = await syncPostInsights(targetId);
      if (!res.success) {
        alert("เกิดข้อผิดพลาดในการดึงสถิติ: " + res.error);
        return;
      }
      const dataRes = await getMonitorData(
        startDate.toISOString(),
        endDate.toISOString(),
        selectedWorkspaceId
      );
      if (dataRes.success) {
        const nextPosts = dataRes.posts || [];
        setPosts(nextPosts);
        if (selectedPost) {
          const updated = nextPosts.find((p) => p.id === selectedPost.id);
          if (updated) setSelectedPost(updated);
        }
      }
    } catch (e: unknown) {
      alert("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsSyncing(null);
    }
  };

  const columns = buildMonitorColumns(startDate, endDate, viewMode);
  const rangeLabel =
    viewMode === "month"
      ? currentDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" })
      : viewMode === "week"
      ? `${startDate.getDate()} ${startDate.toLocaleDateString("th-TH", { month: "short", year: "numeric" })} - ${endDate.getDate()} ${endDate.toLocaleDateString("th-TH", { month: "short", year: "numeric" })}`
      : currentDate.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 neu-raised neu-grain p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => shiftPeriod(-1)}
            className="p-2 rounded-xl neu-pressed text-foreground hover:text-primary transition-colors"
            aria-label="ย้อนกลับ"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display text-sm font-extrabold text-foreground tracking-tight min-w-[160px] text-center">
            {rangeLabel}
          </span>
          <button
            type="button"
            onClick={() => shiftPeriod(1)}
            className="p-2 rounded-xl neu-pressed text-foreground hover:text-primary transition-colors"
            aria-label="ถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-3.5 py-2 neu-pressed hover:text-primary text-muted-foreground text-xs font-bold rounded-xl transition-colors"
          >
            วันนี้
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {workspaces && workspaces.length > 0 && (
            <select
              value={selectedWorkspaceId || ""}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl neu-pressed bg-[var(--surface-recessed)] text-foreground border border-border/60 outline-none focus:ring-2 focus:ring-primary/50 mr-1 [&>option]:bg-[var(--surface-elevated)] [&>option]:text-foreground"
            >
              <option value="" disabled>
                เลือก Workspace
              </option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          )}

          {(
            [
              ["month", "รายเดือน"],
              ["week", "รายสัปดาห์"],
              ["day", "รายวัน"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                viewMode === mode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "neu-pressed text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Grid */}
      {isPending ? (
        <div className="neu-raised neu-grain rounded-3xl p-24 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground text-sm font-semibold">กำลังดึงข้อมูลปฏิทินโพสต์...</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="neu-raised neu-mesh-card neu-grain rounded-3xl p-20 text-center">
          <div className="w-16 h-16 neu-tint-teal rounded-3xl flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-8 h-8" />
          </div>
          <h3 className="font-display text-foreground font-bold text-lg mb-2">
            ไม่มีช่องทาง Social ใน Workspace นี้
          </h3>
          <p className="text-muted-foreground text-sm">
            เชื่อมต่อ Facebook หรือแพลตฟอร์มอื่นๆ ในหน้า Integrations เพื่อเริ่มใช้งาน
          </p>
        </div>
      ) : (
        <div className="neu-raised neu-grain rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${Math.max(800, columns.length * 160 + 256)}px` }}>
              <div className="flex border-b border-border/60 bg-[var(--surface-recessed)]/70">
                <div className="w-64 p-4 font-display font-bold text-foreground text-xs uppercase tracking-wider border-r border-border/60 shrink-0">
                  ช่องทางสื่อสังคมออนไลน์
                </div>
                <div className="flex flex-1">
                  {columns.map((col, idx) => (
                    <div
                      key={idx}
                      className="flex-1 min-w-[160px] p-3 text-center border-r border-border/50 last:border-r-0 shrink-0"
                    >
                      <span className="block text-foreground text-xs font-bold">{col.label}</span>
                      {col.subLabel && (
                        <span className="block text-muted-foreground text-[10px] font-medium mt-0.5">
                          {col.subLabel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-border/60">
                {channels.map((chan) => {
                  const plat = MONITOR_PLATFORMS[chan.platform] ?? {
                    label: chan.platform,
                    icon: "🔗",
                    badgeClass: "bg-[var(--surface-recessed)] text-muted-foreground border-border/70",
                  };
                  return (
                    <div key={chan.id} className="flex min-h-[100px]">
                      <div className="w-64 p-4 border-r border-border/60 flex items-center gap-3 shrink-0 bg-[var(--surface-recessed)]/35">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 font-bold border ${plat.badgeClass}`}
                        >
                          {plat.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{chan.accountName}</p>
                          <p className="text-xs text-muted-foreground font-medium">{plat.label}</p>
                        </div>
                      </div>

                      <div className="flex flex-1 relative">
                        {columns.map((col, idx) => {
                          const slotPosts = getPostsForMonitorSlot(posts, chan.id, col.date, viewMode);
                          return (
                            <div
                              key={idx}
                              className="flex-1 min-w-[160px] p-2 border-r border-border/40 last:border-r-0 min-h-[100px] flex flex-col gap-2 hover:bg-[var(--surface-elevated)]/45 transition-colors shrink-0"
                            >
                              {slotPosts.map((post) => {
                                const target = post.targetConnections.find(
                                  (t) => t.socialConnectionId === chan.id
                                );
                                const channelStatus = target?.status || post.status;
                                const status = MONITOR_STATUS_MAP[channelStatus] ?? {
                                  label: channelStatus,
                                  bg: "bg-[var(--surface-recessed)] text-foreground border-border/70",
                                  dot: "bg-muted-foreground",
                                };
                                const rawTime = post.scheduledTime ?? post.publishedTime;
                                const time = rawTime ? new Date(rawTime) : null;
                                return (
                                  <button
                                    key={post.id}
                                    type="button"
                                    onClick={() => setSelectedPost(post)}
                                    className={`w-full text-left p-2 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${status.bg} cursor-pointer group`}
                                  >
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className="text-[10px] font-bold uppercase font-mono">
                                        {time
                                          ? time.toLocaleTimeString("th-TH", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "—"}
                                      </span>
                                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                    </div>
                                    <p className="text-xs font-semibold text-foreground/90 line-clamp-2 leading-snug">
                                      {post.content || (
                                        <span className="italic text-muted-foreground">ไม่มีข้อความ</span>
                                      )}
                                    </p>
                                    {post.images.length > 0 && (
                                      <div className="mt-1.5 w-full h-8 rounded-lg overflow-hidden border border-border/50 bg-[var(--surface-recessed)]">
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

      {selectedPost && (
        <MonitorPostModal
          post={selectedPost}
          channels={channels}
          isSyncing={isSyncing}
          onSyncInsights={handleSyncInsights}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
