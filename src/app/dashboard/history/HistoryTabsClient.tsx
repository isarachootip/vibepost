"use client";

import React, { useState } from "react";
import { DraftPostItem } from "@/lib/actions/posts";
import { DraftsManagerSection } from "./DraftsManagerSection";
import { HistoryRowActions } from "./HistoryRowActions";
import {
  Layers,
  CheckCircle2,
  Cpu,
  Calendar,
  Sparkles,
  BarChart3,
  Clock,
} from "lucide-react";

type Connection = {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
};

type Props = {
  drafts: DraftPostItem[];
  connections: Connection[];
  posts: any[];
  totalPosts: number;
  totalChannels: number;
  successCount: number;
  aiStats: any;
  workspaceName?: string;
};

const PLATFORM_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  FACEBOOK: {
    label: "Facebook",
    color: "text-blue-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  INSTAGRAM: {
    label: "Instagram",
    color: "text-pink-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  TWITTER: {
    label: "X (Twitter)",
    color: "text-slate-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  LINKEDIN: {
    label: "LinkedIn",
    color: "text-sky-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" r="2" cy="4" />
      </svg>
    ),
  },
  LINE: {
    label: "LINE",
    color: "text-green-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 10.3c0-4.4-4.5-8-10.1-8C8.3 2.3 3.8 5.9 3.8 10.3c0 3.9 3.2 7.2 7.7 7.9-.3 1.1-.9 2.7-.9 2.8-.1.3.1.5.3.6.1 0 .2.1.3.1.2 0 .4-.1.6-.2 1.2-.8 6.4-3.8 8.4-6 1.7-1.3 2.8-3.1 2.8-5.2z"/>
      </svg>
    ),
  },
  TIKTOK: {
    label: "TikTok",
    color: "text-slate-900",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12.5 0v16.1c0 2.2-1.8 3.9-3.9 3.9s-3.9-1.8-3.9-3.9 1.8-3.9 3.9-3.9v-3c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7V4.3c2.4 1.8 5.5 2 6.4 2v-3c-1.5 0-4.3-.4-6.5-2.3z"/>
      </svg>
    ),
  }
};

function formatDate(date: Date | string | null) {
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PUBLISHED: { label: "สำเร็จ", cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
    FAILED: { label: "ล้มเหลว", cls: "bg-red-500/15 text-red-600 border-red-200" },
    SCHEDULED: { label: "มีกำหนดการ", cls: "bg-blue-500/15 text-blue-600 border-blue-200" },
    PENDING: { label: "รอดำเนินการ", cls: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  };
  const cfg = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 border-slate-300" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {cfg.label}
    </span>
  );
}

const ACTION_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  ARTICLE: { label: "เขียนบทความ", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", emoji: "✍️" },
  IMAGE:   { label: "สร้างรูปภาพ", color: "text-pink-700",   bg: "bg-pink-50 border-pink-200",     emoji: "🎨" },
  VIDEO:   { label: "สร้างวิดีโอ",  color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     emoji: "🎬" },
};

export function HistoryTabsClient({
  drafts,
  connections,
  posts,
  totalPosts,
  totalChannels,
  successCount,
  aiStats,
  workspaceName,
}: Props) {
  // Default to drafts tab if there are drafts waiting, otherwise published
  const [activeTab, setActiveTab] = useState<"drafts" | "published" | "ai">(
    drafts.length > 0 ? "drafts" : "published"
  );

  const aiLogs = (aiStats?.logs ?? []) as any[];
  const totalCostTHB = (aiStats?.totalCost ?? 0) * 34.5;

  return (
    <div className="space-y-8">
      {/* Tab Navigation Pill Header */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("drafts")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "drafts"
              ? "bg-white text-purple-900 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4 text-purple-600" />
          <span>คลังแบบร่างรอโพสต์ (Drafts Queue)</span>
          {drafts.length > 0 && (
            <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {drafts.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("published")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "published"
              ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>ประวัติโพสต์สำเร็จ (Published History)</span>
          <span className="text-[10px] text-slate-400 font-bold">({totalPosts})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "ai"
              ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span>ประวัติการใช้ AI & Token</span>
        </button>
      </div>

      {/* ── TAB 1: Drafts Queue (รอตั้งค่าโพสต์) ── */}
      {activeTab === "drafts" && (
        <div className="animate-in fade-in duration-300">
          <DraftsManagerSection initialDrafts={drafts} connections={connections} />
        </div>
      )}

      {/* ── TAB 2: Published Posts History ── */}
      {activeTab === "published" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Post Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "โพสต์ทั้งหมด",
                value: totalPosts,
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#5856d6]">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                ),
                iconBg: "rgba(88,86,214,0.05)",
                valueCls: "text-[#7c7ae0]",
              },
              {
                label: "สำเร็จ",
                value: successCount,
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-emerald-600">
                    <path d="m9 12 2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                ),
                iconBg: "rgba(52,211,153,0.05)",
                valueCls: "text-emerald-600",
              },
              {
                label: "แพลตฟอร์ม",
                value: totalChannels,
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#34aadc]">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                ),
                iconBg: "rgba(52,170,220,0.05)",
                valueCls: "text-[#34aadc]",
              },
              {
                label: "อัตราสำเร็จ",
                value: totalPosts > 0 ? `${Math.round((successCount / totalPosts) * 100)}%` : "—",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber-600">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                iconBg: "rgba(251,191,36,0.05)",
                valueCls: "text-amber-600",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 bg-white shadow-xs"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.iconBg }}>
                  {stat.icon}
                </div>
                <div>
                  <p className={`text-2xl font-black leading-none mb-0.5 ${stat.valueCls}`}>{stat.value}</p>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Post History Table */}
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 p-16 text-center bg-white shadow-xs">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(88,86,214,0.05)" }}>
                <CheckCircle2 className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-semibold text-lg mb-2">ยังไม่มีประวัติการโพสต์</h3>
              <p className="text-slate-500 text-sm">เมื่อระบบโพสต์อัตโนมัติทำงาน ประวัติจะแสดงที่นี่</p>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-sm">รายการโพสต์ล่าสุด</h2>
                <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 font-medium">
                  แสดง {posts.length} รายการล่าสุด
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">วันที่โพสต์</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">เนื้อหา</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">แพลตฟอร์ม</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">รูปภาพ</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">สถานะ</th>
                      <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {posts.map((post) => (
                      <tr key={post.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-slate-600 text-xs font-mono">{formatDate(post.publishedTime)}</span>
                        </td>
                        <td className="px-6 py-4 max-w-[300px]">
                          <p className="text-slate-700 text-sm line-clamp-2 leading-relaxed">
                            {post.content || <span className="text-slate-500 italic">ไม่มีข้อความ</span>}
                          </p>
                          {post.workspace && (
                            <span className="mt-1 inline-block text-xs text-slate-400">
                              Workspace: {post.workspace}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            {post.channels.map((ch: any, idx: number) => {
                              const cfg = PLATFORM_CONFIG[ch.platform];
                              return (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className={cfg?.color ?? "text-slate-500"}>{cfg?.icon ?? <span className="text-xs">{ch.platform}</span>}</span>
                                  <span className="text-xs text-slate-600 font-medium truncate max-w-[120px]">{ch.accountName}</span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {post.images.length > 0 ? (
                            <div className="flex gap-1.5">
                              {post.images.slice(0, 3).map((img: any, idx: number) => (
                                <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={img.url} alt={img.fileName} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                              ))}
                              {post.images.length > 3 && (
                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-500 shrink-0">
                                  +{post.images.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {post.channels.map((ch: any, idx: number) => <StatusBadge key={idx} status={ch.status} />)}
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
      )}

      {/* ── TAB 3: AI Token Usage ── */}
      {activeTab === "ai" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">AI Token & Cost Analytics</h2>
              <p className="text-slate-500 text-xs">สรุปการใช้งาน Token และค่าใช้จ่ายของ AI ใน Workspace</p>
            </div>
          </div>

          {aiStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 bg-gradient-to-br from-purple-50 via-slate-50 to-indigo-50 border border-slate-200 p-6 rounded-3xl shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">ค่าใช้จ่ายสะสม (Est. Cost)</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                  ${aiStats.totalCost.toFixed(5)}
                  <span className="text-xs font-bold text-slate-400">USD</span>
                </h3>
                <span className="text-xs text-purple-600 font-bold block">
                  ≈ {totalCostTHB.toFixed(2)} บาท (THB)
                </span>
              </div>

              <div className="space-y-1 border-l border-slate-200 pl-5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Token ทั้งหมด</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                  {aiStats.totalTokens.toLocaleString()}
                  <span className="text-xs font-bold text-slate-400">Tokens</span>
                </h3>
                <span className="text-xs text-indigo-600 font-bold block">
                  เรียกใช้ AI {aiStats.totalCalls} ครั้ง
                </span>
              </div>

              <div className="space-y-1 border-l border-slate-200 pl-5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">โมดูลเขียนข้อความ (Article)</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {aiStats.articleCalls} <span className="text-xs font-bold text-slate-400">ครั้ง</span>
                </h3>
                <span className="text-xs text-slate-400 font-bold block">Gemini & GPT-3.5</span>
              </div>

              <div className="space-y-1 border-l border-slate-200 pl-5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">โมดูลสร้างสื่อภาพ/วิดีโอ (Media)</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {aiStats.imageCalls + aiStats.videoCalls} <span className="text-xs font-bold text-slate-400">ครั้ง</span>
                </h3>
                <span className="text-xs text-slate-400 font-bold block">Imagen 4, DALL-E & Pexels</span>
              </div>
            </div>
          )}

          {/* AI Logs Table */}
          <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">ประวัติการเรียกใช้งาน AI รายครั้ง</h3>
              <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                แสดง {aiLogs.length} รายการ
              </span>
            </div>

            {aiLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                ยังไม่มีประวัติการเรียกใช้งาน AI
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">เวลา</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">ประเภท</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Provider / Model</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Tokens</th>
                      <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">ค่าใช้จ่าย (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {aiLogs.map((log: any) => {
                      const cfg = ACTION_TYPE_CONFIG[log.actionType] ?? {
                        label: log.actionType,
                        color: "text-slate-600",
                        bg: "bg-slate-50 border-slate-200",
                        emoji: "⚙️",
                      };
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-3 text-xs text-slate-500 font-mono">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.bg} ${cfg.color}`}>
                              <span>{cfg.emoji}</span>
                              <span>{cfg.label}</span>
                            </span>
                          </td>
                          <td className="px-6 py-3 text-xs text-slate-700 font-semibold">
                            <span>{log.provider}</span>
                            {log.modelName && (
                              <span className="text-slate-400 font-normal block text-[10px]">
                                {log.modelName}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-xs font-mono text-slate-600">
                            {log.totalTokens > 0 ? log.totalTokens.toLocaleString() : "—"}
                          </td>
                          <td className="px-6 py-3 text-right text-xs font-mono font-bold text-slate-800">
                            ${log.estimatedCost.toFixed(5)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
