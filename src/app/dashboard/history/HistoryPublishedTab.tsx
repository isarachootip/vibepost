"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { SOCIAL_PLATFORM_META } from "@/components/shared/platform-icons";
import { HistoryRowActions } from "./HistoryRowActions";
import { HistoryStatsGrid } from "./HistoryStatsGrid";
import { formatHistoryDate, HistoryPostItem } from "./history-types";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PUBLISHED: {
      label: "สำเร็จ",
      cls: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border-emerald-500/25",
    },
    FAILED: {
      label: "ล้มเหลว",
      cls: "bg-destructive/12 text-destructive border-destructive/25",
    },
    SCHEDULED: {
      label: "มีกำหนดการ",
      cls: "bg-sky-500/12 text-sky-600 dark:text-sky-300 border-sky-500/25",
    },
    PENDING: {
      label: "รอดำเนินการ",
      cls: "bg-amber-500/12 text-amber-600 dark:text-amber-300 border border-amber-500/25",
    },
  };
  const cfg = map[status] ?? {
    label: status,
    cls: "bg-[var(--surface-recessed)] text-muted-foreground border-border/60",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {cfg.label}
    </span>
  );
}

interface HistoryPublishedTabProps {
  posts: HistoryPostItem[];
  totalPosts: number;
  totalChannels: number;
  successCount: number;
  canManageShowcase?: boolean;
  isSuperAdmin?: boolean;
}

export function HistoryPublishedTab({
  posts,
  totalPosts,
  totalChannels,
  successCount,
  canManageShowcase = false,
  isSuperAdmin = false,
}: HistoryPublishedTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <HistoryStatsGrid
        totalPosts={totalPosts}
        successCount={successCount}
        totalChannels={totalChannels}
      />

      {posts.length === 0 ? (
        <div className="neu-raised neu-mesh-card neu-grain rounded-3xl p-16 text-center">
          <div className="w-16 h-16 neu-tint-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-display text-foreground font-bold text-lg mb-2">ยังไม่มีประวัติการโพสต์ใน Workspace นี้</h3>
          <p className="text-muted-foreground text-sm">เมื่อระบบโพสต์อัตโนมัติทำงาน ประวัติจะแสดงที่นี่</p>
        </div>
      ) : (
        <div className="neu-raised neu-grain rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between gap-2">
            <h2 className="font-display font-bold text-foreground text-sm">รายการโพสต์ล่าสุดของ Workspace นี้</h2>
            <span className="text-xs text-muted-foreground neu-pressed px-3 py-1 rounded-full font-medium">
              แสดง {posts.length} รายการล่าสุด
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-[var(--surface-recessed)]/70">
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">วันที่โพสต์</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">เนื้อหา</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">แพลตฟอร์ม</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">รูปภาพ</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">สถานะ</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {posts.map((post) => (
                  <tr key={post.id} className="group hover:bg-[var(--surface-elevated)]/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-muted-foreground text-xs font-mono">
                        {formatHistoryDate(post.publishedTime)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[300px]">
                      <p className="text-foreground/90 text-sm line-clamp-2 leading-relaxed">
                        {post.content || <span className="text-muted-foreground italic">ไม่มีข้อความ</span>}
                      </p>
                      {post.workspace && (
                        <span className="mt-1 inline-block text-xs text-muted-foreground">
                          Workspace: {post.workspace}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {post.channels.map((ch, idx) => {
                          const cfg = SOCIAL_PLATFORM_META[ch.platform];
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className={cfg?.colorClass ?? "text-muted-foreground"}>
                                {cfg?.icon ?? <span className="text-xs">{ch.platform}</span>}
                              </span>
                              <span className="text-xs text-foreground/80 font-medium truncate max-w-[120px]">
                                {ch.accountName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.images.length > 0 ? (
                        <div className="flex gap-1.5">
                          {post.images.slice(0, 3).map((img, idx) => (
                            <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border border-border/60 bg-[var(--surface-recessed)] shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.url} alt={img.fileName} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {post.channels.map((ch, idx) => (
                          <StatusBadge key={idx} status={ch.status} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <HistoryRowActions
                        postId={post.id}
                        showOnLanding={post.showOnLanding}
                        isPinnedOnLanding={post.isPinnedOnLanding}
                        workspaceShowOnLanding={post.workspaceShowOnLanding}
                        canManageShowcase={canManageShowcase}
                        isSuperAdmin={isSuperAdmin}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
