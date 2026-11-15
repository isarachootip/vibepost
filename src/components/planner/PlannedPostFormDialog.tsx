"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createPlannedPostAction, updatePlannedPostAction } from "@/lib/actions/planner/planned-post.actions";
import {
  PLATFORMS,
  PLANNED_FORMATS,
  type PlannedFormatValue,
  type PlatformValue,
} from "@/lib/validations/planner.schema";
import { bangkokDateTimeToIso, toBangkokDateTimeInput } from "@/lib/services/planner/bangkok-time";
import { usePlannerAction } from "@/hooks/use-planner-action";
import { FORMAT_LABEL, PLATFORM_LABEL } from "./planner-labels";
import { Field, fieldClass } from "./planner-ui";

export interface PlannedPostFormValues {
  id: string;
  slotAt: Date;
  angle: string;
  format: PlannedFormatValue;
  platforms: PlatformValue[];
  notes: string | null;
}

interface Props {
  workspaceId: string;
  campaignId: string;
  plannedPost?: PlannedPostFormValues;
  triggerLabel: string;
}

export function PlannedPostFormDialog({ workspaceId, campaignId, plannedPost, triggerLabel }: Props) {
  const [open, setOpen] = useState(false);
  const { run, pending, error, clearError } = usePlannerAction();
  const selected = new Set<PlatformValue>(plannedPost?.platforms ?? ["FACEBOOK"]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      workspaceId,
      campaignId,
      slotAt: bangkokDateTimeToIso(String(f.get("slotAt"))),
      angle: String(f.get("angle") ?? ""),
      format: String(f.get("format")),
      platforms: f.getAll("platforms").map(String),
      notes: String(f.get("notes") ?? ""),
    };
    run(
      () => (plannedPost ? updatePlannedPostAction(plannedPost.id, payload) : createPlannedPostAction(payload)),
      () => setOpen(false)
    );
  }

  return (
    <>
      <Button variant={plannedPost ? "ghost" : "neu"} size="sm" onClick={() => { clearError(); setOpen(true); }}>
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{plannedPost ? "แก้ไขแผนโพสต์" : "เพิ่มแผนโพสต์"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-3">
            <Field label="วันเวลาที่จะโพสต์ (เวลาไทย) *">
              <input name="slotAt" type="datetime-local" required defaultValue={plannedPost ? toBangkokDateTimeInput(plannedPost.slotAt) : undefined} className={fieldClass} />
            </Field>
            <Field label="มุมเล่าเรื่อง (Angle) *" hint="โพสต์นี้จะพูดเรื่องอะไร">
              <input name="angle" required defaultValue={plannedPost?.angle} placeholder="เช่น 5 สัญญาณว่ายางต้องเปลี่ยนก่อนหน้าฝน" className={fieldClass} />
            </Field>
            <Field label="รูปแบบ">
              <select name="format" defaultValue={plannedPost?.format ?? "IMAGE"} className={fieldClass}>
                {PLANNED_FORMATS.map((fm) => (
                  <option key={fm} value={fm}>{FORMAT_LABEL[fm]}</option>
                ))}
              </select>
            </Field>
            <fieldset>
              <legend className="mb-1 text-xs font-semibold">ช่องทาง *</legend>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <label key={p} className="neu-flat flex cursor-pointer items-center gap-1.5 rounded-xl border border-[var(--border)] px-2.5 py-1.5 text-xs">
                    <input type="checkbox" name="platforms" value={p} defaultChecked={selected.has(p)} />
                    {PLATFORM_LABEL[p]}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="โน้ต">
              <textarea name="notes" rows={2} defaultValue={plannedPost?.notes ?? ""} className={fieldClass} />
            </Field>
            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
            <Button type="submit" variant="tactile" size="lg" disabled={pending}>
              {pending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
