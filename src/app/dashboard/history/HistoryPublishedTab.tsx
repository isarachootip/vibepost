"use client";

import React from "react";
import { Activity, CheckCircle2, FileText, Share2 } from "lucide-react";
import { SOCIAL_PLATFORM_META } from "@/components/shared/platform-icons";
import { HistoryRowActions } from "./HistoryRowActions";
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
      cls: "bg-amber-500/12 text-amber-600 dark:text-amber-300 border-amber-500/25",
    },
  };
  const cfg = map[status] ?? {
    label: status,
    cls: "bg-[var(--surface-recessed)] text-muted-foreground border-border/60",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}
    >
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
}

export function HistoryPublishedTab({
  posts,
  totalPosts,
  totalChannels,
  successCount,
}: HistoryPublishedTabProps) {
  const stats = [
    {
      label: "โพสต์ทั้งหมด",
      value: totalPosts,
      icon: <FileText className="w-5 h-5" />,
      badgeCls: "neu-tint-primary",
      valueCls: "text-primary",
    },
    {
      label: "สำเร็จ",
      value: successCount,
      icon: <CheckCircle2 className="w-5 h-5" />,
      badgeCls: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25",
      valueCls: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "แพลตฟอร์ม",
      value: totalChannels,
      icon: <Share2 className="w-5 h-5" />,
      badgeCls: "neu-tint-teal",
      valueCls: "text-teal-600 dark:text-teal-400",
    },
    {
      label: "อัตราสำเร็จ",
      value: totalPosts > 0 ? `${Math.round((successCount / totalPosts) * 100)}%` : "—",
      icon: <Activity className="w-5 h-5" />,
      badgeCls: "bg-amber-500/12 text-amber-600 dark:text-amber-300 border border-amber-500/25",
      valueCls: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="neu-raised neu-grain rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.badgeCls}`}>
              {stat.icon}
            </div>
            <div>
              <p className={`font-display text-2xl font-extrabold leading-none mb-1 ${stat.valueCls}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="neu-raised neu-mesh-card neu-grain rounded-3xl p-16 text-center">
          <div className="w-16 h-16 neu-tint-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-display text-foreground font-bold text-lg mb-2">ยังไม่มีประวัติการโพสต์</h3>
          <p className="text-muted-foreground text-sm">เมื่อระบบโพสต์อัตโนมัติทำงาน ประวัติจะแสดงที่นี่</p>
        </div>
      ) : (
        <div className="neu-raised neu-grain rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between gap-2">
            <h2 className="font-display font-bold text-foreground text-sm">รายการโพสต์ล่าสุด</h2>
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
                            <div
                              key={idx}
                              className="w-10 h-10 rounded-lg overflow-hidden border border-border/60 bg-[var(--surface-recessed)] shrink-0"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.url} alt={img.fileName} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          ))}
                          {post.images.length > 3 && (
                            <div className="w-10 h-10 rounded-lg neu-pressed flex items-center justify-center text-xs text-muted-foreground shrink-0">
                              +{post.images.length - 3}
                            </div>
                          )}
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
                      <HistoryRowActions postId={post.id} />
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
