import React from "react";
import { Trash2 } from "lucide-react";
import { getTrashPosts, getUserWorkspaceRole } from "@/lib/actions/posts";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { SOCIAL_PLATFORM_META } from "@/components/shared/platform-icons";
import { TrashActions } from "./TrashActions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trash | Vibe Post",
  description: "ถังขยะสำหรับกู้คืนหรือลบโพสต์ถาวร Vibe Post Social Media Management",
};

function formatDate(date: Date | null): string {
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
      <div className="p-8 text-center text-muted-foreground">
        ไม่พบข้อมูล Workspace กรุณาเลือกหรือสร้าง Workspace ก่อนใช้งาน
      </div>
    );
  }

  const userRole = await getUserWorkspaceRole(workspace.id);
  const isAdmin = userRole === "ADMIN";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-rose-500 to-red-600 text-white">
          <Trash2 className="size-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-foreground">
            Trash (ถังขยะ)
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            รายการโพสต์ที่ถูกลบชั่วคราวใน workspace · {workspace.name}
          </p>
        </div>
      </div>

      {trashData.posts.length === 0 ? (
        <div className="neu-raised neu-grain rounded-3xl border border-[var(--border)] p-16 text-center">
          <div className="neu-pressed size-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--border)] text-muted-foreground">
            <Trash2 className="size-8" />
          </div>
          <h3 className="font-display text-foreground text-lg mb-1.5">
            ถังขยะว่างเปล่า
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm">
            ไม่มีโพสต์ที่ถูกลบชั่วคราวอยู่ในถังขยะขณะนี้
          </p>
        </div>
      ) : (
        <div className="neu-raised rounded-3xl border border-[var(--border)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-elevated)]/60">
            <h2 className="font-bold text-foreground text-sm">
              โพสต์ที่ถูกย้ายมาถังขยะ
            </h2>
            <span className="neu-pressed text-xs font-bold text-muted-foreground px-3 py-1 rounded-full border border-[var(--border)] tabular-nums">
              พบ {trashData.totalPosts} รายการ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-elevated)]/30">
                  <th className="text-left px-6 py-3 text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    วันที่ย้าย
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    เนื้อหา
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    แพลตฟอร์มปลายทาง
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    รูปภาพ
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {trashData.posts.map((post) => (
                  <tr
                    key={post.id}
                    className="group hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-muted-foreground text-xs font-mono">
                        {formatDate(post.publishedTime)}
                      </span>
                    </td>

                    <td className="px-6 py-4 max-w-[300px]">
                      <p className="text-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {post.content || (
                          <span className="text-muted-foreground italic">
                            ไม่มีข้อความ
                          </span>
                        )}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {post.channels.map((ch, idx) => {
                          const cfg = SOCIAL_PLATFORM_META[ch.platform];
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className={cfg?.colorClass ?? "text-muted-foreground"}>
                                {cfg?.icon ?? (
                                  <span className="text-xs">{ch.platform}</span>
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
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
                              className="size-10 rounded-xl overflow-hidden border border-[var(--border)] bg-muted shrink-0"
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
                            <div className="neu-pressed size-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-xs text-muted-foreground shrink-0">
                              +{post.images.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>

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
