import React from "react";
import { getPublishedPostsForLanding } from "@/lib/actions/posts";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getAIUsageStatsAction } from "@/lib/actions/ai-generation";
import { HistoryRowActions } from "./HistoryRowActions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Auto Post History | Vibe Post",
  description: "ประวัติการโพสต์อัตโนมัติของระบบ Vibe Post Social Media Management",
};

const PLATFORM_CONFIG: Record<
  string,
  { label: string; color: string; bgGlow: string; icon: React.ReactNode }
> = {
  FACEBOOK: {
    label: "Facebook",
    color: "text-blue-600",
    bgGlow: "rgba(59,130,246,0.15)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  INSTAGRAM: {
    label: "Instagram",
    color: "text-pink-600",
    bgGlow: "rgba(236,72,153,0.15)",
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
    bgGlow: "rgba(148,163,184,0.12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  LINKEDIN: {
    label: "LinkedIn",
    color: "text-sky-600",
    bgGlow: "rgba(56,189,248,0.15)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  LINE: {
    label: "LINE",
    color: "text-green-500",
    bgGlow: "rgba(34,197,94,0.15)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 10.3c0-4.4-4.5-8-10.1-8C8.3 2.3 3.8 5.9 3.8 10.3c0 3.9 3.2 7.2 7.7 7.9-.3 1.1-.9 2.7-.9 2.8-.1.3.1.5.3.6.1 0 .2.1.3.1.2 0 .4-.1.6-.2 1.2-.8 6.4-3.8 8.4-6 1.7-1.3 2.8-3.1 2.8-5.2z"/>
      </svg>
    ),
  },
  TIKTOK: {
    label: "TikTok",
    color: "text-slate-900",
    bgGlow: "rgba(15,23,42,0.15)",
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

export default async function AutoPostHistoryPage() {
  const [workspace, { posts, totalPosts, totalChannels }, aiUsageResult] = await Promise.all([
    getActiveWorkspaceContext(),
    getPublishedPostsForLanding(),
    getAIUsageStatsAction(),
  ]);

  const successCount = posts.filter((p) =>
    p.channels.every((c) => c.status === "PUBLISHED")
  ).length;

  const aiStats = aiUsageResult.success ? aiUsageResult.stats : null;
  const aiLogs = (aiStats?.logs ?? []) as any[];
  const totalCostTHB = (aiStats?.totalCost ?? 0) * 34.5;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-10">

      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #5856d6, #34aadc)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="m9 16 2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Auto Post History</h1>
            <p className="text-slate-500 text-sm">
              ประวัติการโพสต์อัตโนมัติ{workspace ? ` · ${workspace.name}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* ── Post Stats Row ── */}
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
            className="rounded-2xl border border-slate-200 p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 bg-white shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.iconBg }}>
              {stat.icon}
            </div>
            <div>
              <p className={`text-2xl font-extrabold leading-none mb-0.5 ${stat.valueCls}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Post History Table ── */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 p-16 text-center bg-white">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(88,86,214,0.05)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#5856d6" strokeWidth="1.5" className="w-8 h-8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-slate-900 font-semibold text-lg mb-2">ยังไม่มีประวัติการโพสต์</h3>
          <p className="text-slate-500 text-sm">เมื่อระบบโพสต์อัตโนมัติทำงาน ประวัติจะแสดงที่นี่</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 text-sm">รายการโพสต์ล่าสุด</h2>
            <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              แสดง {posts.length} รายการล่าสุด
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">วันที่โพสต์</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">เนื้อหา</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">แพลตฟอร์ม</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">รูปภาพ</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">สถานะ</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">การจัดการ</th>
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
                        <span className="mt-1 inline-block text-xs text-slate-500">
                          Workspace: {post.workspace}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {post.channels.map((ch, idx) => {
                          const cfg = PLATFORM_CONFIG[ch.platform];
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className={cfg?.color ?? "text-slate-500"}>{cfg?.icon ?? <span className="text-xs">{ch.platform}</span>}</span>
                              <span className="text-xs text-slate-500 truncate max-w-[100px]">{ch.accountName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.images.length > 0 ? (
                        <div className="flex gap-1.5">
                          {post.images.slice(0, 3).map((img, idx) => (
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
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {post.channels.map((ch, idx) => <StatusBadge key={idx} status={ch.status} />)}
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

          <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-500">ข้อมูลจากระบบ Vibe Post · อัปเดตอัตโนมัติ</p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Live
            </div>
          </div>
        </div>
      )}

      {/* ── AI Token Usage Section ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-600 to-indigo-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">AI Token Usage History</h2>
            <p className="text-slate-500 text-sm">ประวัติการใช้งาน AI — Token และค่าใช้จ่ายสะสมทั้งหมด</p>
          </div>
        </div>

        {aiStats ? (
          <>
            {/* AI Summary Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "ค่าใช้จ่ายสะสม (USD)",
                  value: `$${aiStats.totalCost.toFixed(5)}`,
                  sub: `≈ ${totalCostTHB.toFixed(2)} บาท`,
                  color: "text-purple-600",
                  subColor: "text-purple-500",
                  bg: "rgba(147,51,234,0.05)",
                  icon: "💰",
                },
                {
                  label: "Token ที่ใช้ทั้งหมด",
                  value: aiStats.totalTokens.toLocaleString(),
                  sub: `เรียกใช้ AI รวม ${aiStats.totalCalls} ครั้ง`,
                  color: "text-indigo-600",
                  subColor: "text-indigo-400",
                  bg: "rgba(99,102,241,0.05)",
                  icon: "🔢",
                },
                {
                  label: "เขียนบทความ / แคปชัน",
                  value: aiStats.articleCalls,
                  sub: "Article / Caption",
                  color: "text-violet-600",
                  subColor: "text-violet-400",
                  bg: "rgba(139,92,246,0.05)",
                  icon: "✍️",
                },
                {
                  label: "สร้างรูปภาพ / วิดีโอ",
                  value: aiStats.imageCalls + aiStats.videoCalls,
                  sub: `${aiStats.imageCalls} รูป · ${aiStats.videoCalls} วิดีโอ`,
                  color: "text-pink-600",
                  subColor: "text-pink-400",
                  bg: "rgba(236,72,153,0.05)",
                  icon: "🎨",
                },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm hover:-translate-y-0.5 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">{stat.label}</p>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                  <p className={`text-2xl font-extrabold leading-none mb-1 ${stat.color}`}>{stat.value}</p>
                  <p className={`text-[11px] font-semibold ${stat.subColor}`}>{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Detailed Log Table */}
            {aiLogs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 p-12 text-center bg-white">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="text-slate-700 font-semibold mb-1">ยังไม่มีการใช้งาน AI</h3>
                <p className="text-slate-400 text-sm">เมื่อคุณใช้งาน AI Studio หรือ AI Caption ประวัติจะแสดงที่นี่</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/60 to-indigo-50/40">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <span className="text-purple-600">⚡</span>
                    รายการการใช้งาน AI ล่าสุด
                  </h3>
                  <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                    แสดง {aiLogs.length} รายการล่าสุด
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">วันที่/เวลา</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">ประเภท</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Provider / Model</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Input Token</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Output Token</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total Token</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">USD</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">บาท (THB)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aiLogs.map((log: any) => {
                        const typeCfg = ACTION_TYPE_CONFIG[log.actionType] ?? {
                          label: log.actionType, color: "text-slate-700", bg: "bg-slate-50 border-slate-200", emoji: "🤖"
                        };
                        const costTHB = log.estimatedCost * 34.5;
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className="text-xs text-slate-500 font-mono">{formatDate(log.createdAt)}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${typeCfg.bg} ${typeCfg.color}`}>
                                {typeCfg.emoji} {typeCfg.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700">{log.provider}</span>
                                {log.modelName && (
                                  <span className="text-[10px] text-slate-400 font-mono">{log.modelName}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="text-xs font-mono text-slate-600">
                                {log.promptTokens > 0 ? log.promptTokens.toLocaleString() : "—"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="text-xs font-mono text-slate-600">
                                {log.completionTokens > 0 ? log.completionTokens.toLocaleString() : "—"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className={`text-xs font-bold font-mono ${log.totalTokens > 0 ? "text-indigo-700" : "text-slate-400"}`}>
                                {log.totalTokens > 0 ? log.totalTokens.toLocaleString() : "—"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="text-xs font-mono text-slate-600">
                                ${log.estimatedCost.toFixed(5)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className={`text-xs font-bold ${costTHB > 0 ? "text-purple-700" : "text-slate-400"}`}>
                                {costTHB > 0 ? `฿${costTHB.toFixed(4)}` : "ฟรี"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-purple-200 bg-gradient-to-r from-purple-50/80 to-indigo-50/50">
                        <td colSpan={5} className="px-5 py-3.5 text-xs font-black text-slate-700 uppercase tracking-wide">
                          รวมทั้งหมด ({aiStats.totalCalls} ครั้ง)
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-black text-indigo-700">{aiStats.totalTokens.toLocaleString()}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-black text-slate-700">${aiStats.totalCost.toFixed(5)}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-black text-purple-700">฿{totalCostTHB.toFixed(4)}</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-slate-200 p-10 text-center bg-white">
            <p className="text-slate-400 text-sm">ไม่สามารถโหลดข้อมูลการใช้งาน AI ได้</p>
          </div>
        )}
      </div>

      {/* ── Timeline Section (last 5 posts) ── */}
      {posts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Timeline — 5 โพสต์ล่าสุด
          </h2>
          <div className="relative pl-6">
            <div
              className="absolute left-2 top-0 bottom-0 w-px"
              style={{ background: "linear-gradient(to bottom, #5856d6, transparent)" }}
            />
            <div className="space-y-5">
              {posts.slice(0, 5).map((post, idx) => (
                <div key={post.id} className="relative">
                  <div
                    className="absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 shadow-[0_0_8px_rgba(88,86,214,0.6)]"
                    style={{ borderColor: "#5856d6", background: idx === 0 ? "#5856d6" : "#1a1a2e" }}
                  />
                  <div className="rounded-2xl border border-slate-200 p-5 bg-white transition-all hover:border-[#5856d6]/40 hover:shadow-[0_0_20px_rgba(88,86,214,0.08)]">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 text-sm leading-relaxed line-clamp-2">
                          {post.content || <span className="text-slate-500 italic">ไม่มีข้อความ</span>}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="text-xs text-slate-500 font-mono">{formatDate(post.publishedTime)}</span>
                          <div className="flex items-center gap-1.5">
                            {post.channels.map((ch, i) => {
                              const cfg = PLATFORM_CONFIG[ch.platform];
                              return (
                                <span key={i} className={`flex items-center gap-1 text-xs ${cfg?.color ?? "text-slate-500"}`} title={ch.accountName}>
                                  {cfg?.icon}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      {post.images[0] && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={post.images[0].url} alt="Post preview" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
