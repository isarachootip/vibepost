"use client";

import { skipPlannedPostAction } from "@/lib/actions/planner/planned-post.actions";
import { isPlannedPostLocked } from "@/lib/services/planner/planned-post-rules.service";
import type { PlannedPostStatusValue } from "@/lib/services/planner/planned-post-rules.service";
import { usePlannerAction } from "@/hooks/use-planner-action";
import { Button } from "@/components/ui/button";
import { FORMAT_LABEL, PLANNED_STATUS_LABEL, PLANNED_STATUS_TONE, PLATFORM_LABEL } from "./planner-labels";
import { PlannedPostFormDialog, type PlannedPostFormValues } from "./PlannedPostFormDialog";
import { StatusBadge, formatThaiDate } from "./planner-ui";

export interface PlannedPostRow extends PlannedPostFormValues {
  status: PlannedPostStatusValue;
}

interface Props {
  workspaceId: string;
  campaignId: string;
  rows: PlannedPostRow[];
  canEdit: boolean;
}

export function PlannedPostList({ workspaceId, campaignId, rows, canEdit }: Props) {
  const { run, pending, error } = usePlannerAction();

  if (rows.length === 0) {
    return <p className="text-xs text-muted-foreground">ยังไม่มีแผนโพสต์ใน Campaign นี้</p>;
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <ul className="space-y-2">
        {rows.map((r) => {
          const editable = canEdit && !isPlannedPostLocked(r.status) && r.status !== "SKIPPED";
          return (
            <li key={r.id} className={`neu-pressed flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border)] p-3 ${r.status === "SKIPPED" ? "opacity-50" : ""}`}>
              <div className="w-28 shrink-0 text-xs text-muted-foreground">{formatThaiDate(r.slotAt, true)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{r.angle}</p>
                <p className="text-[11px] text-muted-foreground">
                  {FORMAT_LABEL[r.format]} · {r.platforms.map((p) => PLATFORM_LABEL[p]).join(", ")}
                  {r.notes ? ` · ${r.notes}` : ""}
                </p>
              </div>
              <StatusBadge tone={PLANNED_STATUS_TONE[r.status]}>{PLANNED_STATUS_LABEL[r.status]}</StatusBadge>
              {editable && (
                <div className="flex gap-1">
                  <PlannedPostFormDialog workspaceId={workspaceId} campaignId={campaignId} plannedPost={r} triggerLabel="แก้ไข" />
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => run(() => skipPlannedPostAction({ workspaceId, plannedPostId: r.id }))}
                  >
                    ข้าม
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
