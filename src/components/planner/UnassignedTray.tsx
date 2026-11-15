"use client";

import { assignPostTopicAction } from "@/lib/actions/planner/planned-post.actions";
import { usePlannerAction } from "@/hooks/use-planner-action";
import { fieldClass, formatThaiDate } from "./planner-ui";

interface UnassignedPost {
  id: string;
  content: string;
  createdAt: Date;
}

interface Props {
  workspaceId: string;
  posts: UnassignedPost[];
  topics: { id: string; name: string }[];
  canEdit: boolean;
}

export function UnassignedTray({ workspaceId, posts, topics, canEdit }: Props) {
  const { run, pending, error } = usePlannerAction();

  function assign(postId: string, topicId: string) {
    if (!topicId) return;
    run(() => assignPostTopicAction({ workspaceId, postId, topicId }));
  }

  return (
    <section className="neu-raised rounded-3xl border border-[var(--border)] p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-base text-foreground">📥 โพสต์ที่ยังไม่จัดหมวด (Unassigned)</h2>
        <span className="text-[11px] text-muted-foreground">ปุ่ม &quot;AI จัดหมวดให้&quot; มาใน Phase 4</span>
      </div>
      {error && <p className="mb-2 text-xs font-semibold text-destructive">{error}</p>}
      {posts.length === 0 ? (
        <p className="text-xs text-muted-foreground">ไม่มีโพสต์ที่ยังไม่จัดหมวด 🎉</p>
      ) : (
        <ul className="max-h-96 space-y-2 overflow-y-auto custom-scrollbar">
          {posts.map((p) => (
            <li key={p.id} className="neu-pressed flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border)] p-3">
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs text-foreground">{p.content}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{formatThaiDate(p.createdAt)}</p>
              </div>
              {canEdit && topics.length > 0 && (
                <select
                  aria-label="เลือก Topic"
                  defaultValue=""
                  disabled={pending}
                  onChange={(e) => assign(p.id, e.target.value)}
                  className={`${fieldClass} w-40`}
                >
                  <option value="" disabled>
                    ย้ายเข้า Topic...
                  </option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
