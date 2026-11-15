"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createCampaignAction, updateCampaignAction } from "@/lib/actions/planner/campaign.actions";
import { CAMPAIGN_GOALS, type CampaignGoalValue } from "@/lib/validations/planner.schema";
import { bangkokDateToIso, toBangkokDateInput } from "@/lib/services/planner/bangkok-time";
import { usePlannerAction } from "@/hooks/use-planner-action";
import { GOAL_INFO } from "./planner-labels";
import { Field, fieldClass } from "./planner-ui";

export interface CampaignFormValues {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal: CampaignGoalValue;
  kpiTarget: number | null;
  budget: number | null;
}

interface Props {
  workspaceId: string;
  topicId: string;
  campaign?: CampaignFormValues;
  triggerLabel: string;
}

const optionalNumber = (v: FormDataEntryValue | null): number | undefined =>
  v === null || String(v).trim() === "" ? undefined : Number(v);

export function CampaignFormDialog({ workspaceId, topicId, campaign, triggerLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState<CampaignGoalValue>(campaign?.goal ?? "AWARENESS");
  const { run, pending, error, clearError } = usePlannerAction();
  const info = GOAL_INFO[goal];

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      workspaceId,
      topicId,
      name: String(f.get("name") ?? ""),
      startDate: bangkokDateToIso(String(f.get("startDate"))),
      endDate: bangkokDateToIso(String(f.get("endDate"))),
      goal,
      kpiTarget: optionalNumber(f.get("kpiTarget")),
      budget: optionalNumber(f.get("budget")),
    };
    run(
      () => (campaign ? updateCampaignAction(campaign.id, payload) : createCampaignAction(payload)),
      () => setOpen(false)
    );
  }

  return (
    <>
      <Button variant={campaign ? "ghost" : "tactile"} size={campaign ? "sm" : "lg"} onClick={() => { clearError(); setOpen(true); }}>
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{campaign ? "แก้ไข Campaign" : "สร้าง Campaign ใหม่"}</DialogTitle>
            <DialogDescription>Campaign คือช่วงเวลาที่โฟกัสเรื่องหนึ่ง เช่น &quot;ยางหน้าฝน พ.ย.–ธ.ค.&quot;</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-3">
            <Field label="ชื่อ Campaign *">
              <input name="name" required defaultValue={campaign?.name} className={fieldClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="วันเริ่ม *">
                <input name="startDate" type="date" required defaultValue={campaign ? toBangkokDateInput(campaign.startDate) : undefined} className={fieldClass} />
              </Field>
              <Field label="วันสิ้นสุด *">
                <input name="endDate" type="date" required defaultValue={campaign ? toBangkokDateInput(campaign.endDate) : undefined} className={fieldClass} />
              </Field>
            </div>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-xs font-semibold">Campaign นี้อยากได้อะไร?</legend>
              {CAMPAIGN_GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={`rounded-2xl border p-3 text-left text-xs transition-all ${goal === g ? "neu-pressed border-primary/50" : "neu-flat border-[var(--border)]"}`}
                >
                  <b>{GOAL_INFO[g].emoji} {GOAL_INFO[g].label}</b>
                  <span className="block text-muted-foreground">วัดด้วย {GOAL_INFO[g].metric}: {GOAL_INFO[g].explain}</span>
                </button>
              ))}
            </fieldset>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`เป้า ${info.metric} (${info.unit})`} hint="ไม่ทราบ? เว้นว่างไว้ — Phase 4 AI จะแนะนำให้">
                <input name="kpiTarget" type="number" min="0" step="any" defaultValue={campaign?.kpiTarget ?? undefined} className={fieldClass} />
              </Field>
              <Field label="งบโฆษณา (บาท)" hint="ไม่ได้ยิงโฆษณา เว้นว่างได้">
                <input name="budget" type="number" min="0" step="any" defaultValue={campaign?.budget ?? undefined} className={fieldClass} />
              </Field>
            </div>
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
