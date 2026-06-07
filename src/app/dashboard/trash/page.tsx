import React from "react";
import { getTrashPosts, getUserWorkspaceRole } from "@/lib/actions/posts";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { TrashActions } from "./TrashActions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trash | Vibe Post",
  description: "ถังขยะสำหรับกู้คืนหรือลบโพสต์ถาวร Vibe Post Social Media Management",
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

export default async function TrashPage() {
  const [workspace, trashData] = await Promise.all([
    getActiveWorkspaceContext(),
    getTrashPosts(),
  ]);

  if (!workspace) {
    return (
      <div className="p-8 text-center text-slate-500">
        ไม่พบข้อมูล Workspace กรุณาเลือกหรือสร้าง Workspace ก่อนใช้งาน
      </div>
    );
  }

  const userRole = await getUserWorkspaceRole(workspace.id);
  const isAdmin = userRole === "ADMIN";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-red-500 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Trash (ถังขยะ)</h1>
            <p className="text-slate-500 text-sm">
              รายการโพสต์ที่ถูกลบชั่วคราวใน workspace · {workspace.name}
            </p>
          </div>
        </div>
      </div>

      {/* ── Trash Table / Empty State ── */}
      {trashData.posts.length === 0 ? (
        <div
          className="rounded-2xl border border-slate-200 p-16 text-center"
          style={{ background: "#ffffff" }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </div>
          <h3 className="text-slate-900 font-semibold text-lg mb-2">ถังขยะว่างเปล่า</h3>
          <p className="text-slate-500 text-sm">ไม่มีโพสต์ที่ถูกลบชั่วคราวอยู่ในถังขยะขณะนี้</p>
        </div>
      ) : (
        <div
          className="rounded-2xl border border-slate-200 overflow-hidden"
          style={{ background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
        >
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-semibold text-slate-900 text-sm">โพสต์ที่ถูกย้ายมาถังขยะ</h2>
            <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              พบ {trashData.totalPosts} รายการ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/20">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    วันที่ย้าย
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    เนื้อหา
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    แพลตฟอร์มปลายทาง
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    รูปภาพ
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trashData.posts.map((post) => (
                  <tr
                    key={post.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-slate-600 text-xs font-mono">
                        {formatDate(post.publishedTime)}
                      </span>
                    </td>

                    {/* Content Preview */}
                    <td className="px-6 py-4 max-w-[300px]">
                      <p className="text-slate-700 text-sm line-clamp-2 leading-relaxed">
                        {post.content || <span className="text-slate-500 italic">ไม่มีข้อความ</span>}
                      </p>
                    </td>

                    {/* Platforms */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {post.channels.map((ch, idx) => {
                          const cfg = PLATFORM_CONFIG[ch.platform];
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className={cfg?.color ?? "text-slate-500"}>
                                {cfg?.icon ?? <span className="text-xs">{ch.platform}</span>}
                              </span>
                              <span className="text-xs text-slate-500 truncate max-w-[100px]">
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
                              className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0"
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
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-500 shrink-0">
                              +{post.images.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <TrashActions postId={post.id} isAdmin={isAdmin} />
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
