"use client";

import React from "react";
import { MonitorChannel, MonitorPost } from "@/lib/actions/monitor";
import { Clock, LineChart, RefreshCw, X } from "lucide-react";
import {
  formatMonitorDate,
  MONITOR_PLATFORMS,
  MONITOR_STATUS_MAP,
} from "./monitor-helpers";

interface MonitorPostModalProps {
  post: MonitorPost;
  channels: MonitorChannel[];
  isSyncing: string | null;
  onSyncInsights: (targetId: string) => void;
  onClose: () => void;
}

export function MonitorPostModal({
  post,
  channels,
  isSyncing,
  onSyncInsights,
  onClose,
}: MonitorPostModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="neu-lifted neu-grain bg-[var(--surface-elevated)] rounded-3xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border/60 flex items-center justify-between bg-[var(--surface-recessed)]/70">
          <div>
            <h3 className="font-display text-lg font-extrabold text-foreground">
              รายละเอียดโพสต์
            </h3>
            <span className="text-xs font-medium text-muted-foreground">
              มีกำหนดการ/โพสต์: {formatMonitorDate(post.scheduledTime || post.publishedTime)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl neu-pressed text-muted-foreground hover:text-foreground transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              ข้อความบรรยาย (Caption)
            </h4>
            <div className="neu-pressed bg-[var(--surface-recessed)] p-4 rounded-2xl text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {post.content || (
                <span className="italic text-muted-foreground">ไม่มีข้อความบรรยาย</span>
              )}
            </div>
          </div>

          {post.images.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                สื่อแนบ (Media)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {post.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-2xl border border-border/60 bg-[var(--surface-recessed)] overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="Post media" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              สถานะแต่ละช่องทาง
            </h4>
            <div className="divide-y divide-border/60 border border-border/60 rounded-2xl overflow-hidden bg-[var(--surface-recessed)]/50">
              {post.targetConnections.map((t, idx) => {
                const status = MONITOR_STATUS_MAP[t.status] ?? {
                  label: t.status,
                  bg: "bg-[var(--surface-recessed)] text-muted-foreground border-border/70",
                  dot: "bg-muted-foreground",
                };
                const chan = channels.find((c) => c.id === t.socialConnectionId);
                const plat = chan ? MONITOR_PLATFORMS[chan.platform] : null;
                const metrics = [
                  { label: "Reach", value: t.reach || 0, dot: "bg-sky-500" },
                  { label: "Engagement", value: t.engagement || 0, dot: "bg-rose-500" },
                  { label: "Impressions", value: t.impressions || 0, dot: "bg-amber-500" },
                  { label: "Clicks", value: t.clicks || 0, dot: "bg-emerald-500" },
                ];

                return (
                  <div key={idx} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base">{plat?.icon || "🔗"}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {chan?.accountName || "Unknown Channel"}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {plat?.label || "Social"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                        {t.errorMessage && (
                          <span
                            className="text-[10px] text-destructive font-medium max-w-[200px] truncate"
                            title={t.errorMessage}
                          >
                            {t.errorMessage}
                          </span>
                        )}
                      </div>
                    </div>

                    {t.status === "PUBLISHED" && (
                      <div className="neu-raised rounded-2xl p-4 mt-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg neu-tint-primary flex items-center justify-center">
                              <LineChart className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-display text-sm font-bold text-foreground tracking-tight">
                              ประสิทธิภาพ (Insights)
                            </span>
                          </div>
                          {["Facebook", "Instagram", "TikTok"].includes(plat?.label || "") && (
                            <button
                              type="button"
                              onClick={() => onSyncInsights(t.id)}
                              disabled={isSyncing === t.id}
                              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl neu-raised hover:text-primary text-muted-foreground transition-all disabled:opacity-50"
                            >
                              <RefreshCw
                                className={`w-3 h-3 ${isSyncing === t.id ? "animate-spin" : ""}`}
                              />
                              {isSyncing === t.id ? "กำลังซิงค์..." : "ซิงค์สถิติ"}
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {metrics.map((metric) => (
                            <div key={metric.label} className="neu-pressed p-3 rounded-xl">
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className={`w-2 h-2 rounded-full ${metric.dot}`} />
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                  {metric.label}
                                </span>
                              </div>
                              <span className="font-display block text-xl font-extrabold text-foreground tracking-tight">
                                {metric.value.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {t.insightsSyncedAt && (
                          <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-muted-foreground font-medium">
                            <Clock className="w-3 h-3" />
                            <span>
                              อัปเดตล่าสุด: {new Date(t.insightsSyncedAt).toLocaleString("th-TH")}
                            </span>
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
  );
}
