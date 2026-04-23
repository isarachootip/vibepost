import React from "react";
import { getPublishedPostsForLanding } from "@/lib/actions/posts";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";

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
    color: "text-blue-400",
    bgGlow: "rgba(59,130,246,0.15)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  INSTAGRAM: {
    label: "Instagram",
    color: "text-pink-400",
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
    color: "text-slate-300",
    bgGlow: "rgba(148,163,184,0.12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  LINKEDIN: {
    label: "LinkedIn",
    color: "text-sky-400",
    bgGlow: "rgba(56,189,248,0.15)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
};

function formatDate(date: Date | null) {
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
    PUBLISHED: { label: "สำเร็จ", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    FAILED: { label: "ล้มเหลว", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
    PENDING: { label: "รอดำเนินการ", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  };
  const cfg = map[status] ?? { label: status, cls: "bg-slate-700 text-slate-300 border-slate-600" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {cfg.label}
    </span>
  );
}

export default async function AutoPostHistoryPage() {
  const [workspace, { posts, totalPosts, totalChannels }] = await Promise.all([
    getActiveWorkspaceContext(),
    getPublishedPostsForLanding(),
  ]);

  const successCount = posts.filter((p) =>
    p.channels.every((c) => c.status === "PUBLISHED")
  ).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #5856d6, #34aadc)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="m9 16 2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Auto Post History</h1>
            <p className="text-slate-400 text-sm">
              ประวัติการโพสต์อัตโนมัติ{workspace ? ` · ${workspace.name}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
            iconBg: "rgba(88,86,214,0.12)",
            valueCls: "text-[#7c7ae0]",
          },
          {
            label: "สำเร็จ",
            value: successCount,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-emerald-400">
                <path d="m9 12 2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            ),
            iconBg: "rgba(52,211,153,0.12)",
            valueCls: "text-emerald-400",
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
            iconBg: "rgba(52,170,220,0.12)",
            valueCls: "text-[#34aadc]",
          },
          {
            label: "อัตราสำเร็จ",
            value: totalPosts > 0 ? `${Math.round((successCount / totalPosts) * 100)}%` : "—",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber-400">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            ),
            iconBg: "rgba(251,191,36,0.12)",
            valueCls: "text-amber-400",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:border-white/20"
            style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: stat.iconBg }}
            >
              {stat.icon}
            </div>
            <div>
              <p className={`text-2xl font-extrabold leading-none mb-0.5 ${stat.valueCls}`}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── History Table / Cards ── */}
      {posts.length === 0 ? (
        <div
          className="rounded-2xl border border-white/10 p-16 text-center"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(88,86,214,0.12)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#5856d6" strokeWidth="1.5" className="w-8 h-8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">ยังไม่มีประวัติการโพสต์</h3>
          <p className="text-slate-400 text-sm">เมื่อระบบโพสต์อัตโนมัติทำงาน ประวัติจะแสดงที่นี่</p>
        </div>
      ) : (
        <div
          className="rounded-2xl border border-white/10 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(12px)" }}
        >
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">รายการโพสต์ล่าสุด</h2>
            <span className="text-xs text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              แสดง {posts.length} รายการล่าสุด
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    วันที่โพสต์
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    เนื้อหา
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    แพลตฟอร์ม
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    รูปภาพ
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="group hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-slate-300 text-xs font-mono">
                        {formatDate(post.publishedTime)}
                      </span>
                    </td>

                    {/* Content Preview */}
                    <td className="px-6 py-4 max-w-[300px]">
                      <p className="text-slate-200 text-sm line-clamp-2 leading-relaxed">
                        {post.content || <span className="text-slate-500 italic">ไม่มีข้อความ</span>}
                      </p>
                      {post.workspace && (
                        <span className="mt-1 inline-block text-xs text-slate-500">
                          Workspace: {post.workspace}
                        </span>
                      )}
                    </td>

                    {/* Platforms */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {post.channels.map((ch, idx) => {
                          const cfg = PLATFORM_CONFIG[ch.platform];
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className={cfg?.color ?? "text-slate-400"}>
                                {cfg?.icon ?? <span className="text-xs">{ch.platform}</span>}
                              </span>
                              <span className="text-xs text-slate-400 truncate max-w-[100px]">
                                {ch.accountName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* Images */}
                    <td className="px-6 py-4">
                      {post.images.length > 0 ? (
                        <div className="flex gap-1.5">
                          {post.images.slice(0, 3).map((img, idx) => (
                            <div
                              key={idx}
                              className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-slate-800 shrink-0"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.url}
                                alt={img.fileName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ))}
                          {post.images.length > 3 && (
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-slate-400 shrink-0">
                              +{post.images.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {post.channels.map((ch, idx) => (
                          <StatusBadge key={idx} status={ch.status} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-white/6 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              ข้อมูลจากระบบ Vibe Post · อัปเดตอัตโนมัติ
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Live
            </div>
          </div>
        </div>
      )}

      {/* ── Timeline Section (last 5 posts visual) ── */}
      {posts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Timeline — 5 โพสต์ล่าสุด
          </h2>
          <div className="relative pl-6">
            {/* Vertical line */}
            <div
              className="absolute left-2 top-0 bottom-0 w-px"
              style={{ background: "linear-gradient(to bottom, #5856d6, transparent)" }}
            />

            <div className="space-y-5">
              {posts.slice(0, 5).map((post, idx) => (
                <div key={post.id} className="relative">
                  {/* Dot */}
                  <div
                    className="absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 shadow-[0_0_8px_rgba(88,86,214,0.6)]"
                    style={{
                      borderColor: "#5856d6",
                      background: idx === 0 ? "#5856d6" : "#1a1a2e",
                    }}
                  />

                  <div
                    className="rounded-2xl border border-white/10 p-5 transition-all hover:border-[#5856d6]/40 hover:shadow-[0_0_20px_rgba(88,86,214,0.08)]"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm leading-relaxed line-clamp-2">
                          {post.content || <span className="text-slate-500 italic">ไม่มีข้อความ</span>}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="text-xs text-slate-500 font-mono">
                            {formatDate(post.publishedTime)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {post.channels.map((ch, i) => {
                              const cfg = PLATFORM_CONFIG[ch.platform];
                              return (
                                <span
                                  key={i}
                                  className={`flex items-center gap-1 text-xs ${cfg?.color ?? "text-slate-400"}`}
                                  title={ch.accountName}
                                >
                                  {cfg?.icon}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      {post.images[0] && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.images[0].url}
                            alt="Post preview"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
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
