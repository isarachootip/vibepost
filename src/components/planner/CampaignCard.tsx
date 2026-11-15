import {
  allowedCampaignTransitions,
  hasWorkspaceRole,
  isCampaignEditable,
  type CampaignStatusValue,
  type WorkspaceRoleValue,
} from "@/lib/services/planner/campaign-status.service";
import { CAMPAIGN_STATUS_LABEL, CAMPAIGN_STATUS_TONE, GOAL_INFO } from "./planner-labels";
import { CampaignFormDialog, type CampaignFormValues } from "./CampaignFormDialog";
import { CampaignStatusActions } from "./CampaignStatusActions";
import { PlannedPostFormDialog } from "./PlannedPostFormDialog";
import { PlannedPostList, type PlannedPostRow } from "./PlannedPostList";
import { StatusBadge, formatThaiDate } from "./planner-ui";

export interface CampaignCardData extends CampaignFormValues {
  status: CampaignStatusValue;
  currency: string;
  plannedPosts: PlannedPostRow[];
}

interface Props {
  workspaceId: string;
  topicId: string;
  role: WorkspaceRoleValue;
  campaign: CampaignCardData;
}

export function CampaignCard({ workspaceId, topicId, role, campaign: c }: Props) {
  const goal = GOAL_INFO[c.goal];
  const canEdit = hasWorkspaceRole(role, "MEMBER") && isCampaignEditable(c.status);
  const activePosts = c.plannedPosts.filter((p) => p.status !== "SKIPPED").length;
  const formValues: CampaignFormValues = {
    id: c.id,
    name: c.name,
    startDate: c.startDate,
    endDate: c.endDate,
    goal: c.goal,
    kpiTarget: c.kpiTarget,
    budget: c.budget,
  };
  const rows: PlannedPostRow[] = c.plannedPosts.map((p) => ({
    id: p.id,
    slotAt: p.slotAt,
    angle: p.angle,
    format: p.format,
    platforms: p.platforms,
    notes: p.notes,
    status: p.status,
  }));

  return (
    <article className={`neu-raised rounded-3xl border border-[var(--border)] p-5 ${c.status === "ARCHIVED" ? "opacity-60" : ""}`}>
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base text-foreground">{c.name}</h3>
            <StatusBadge tone={CAMPAIGN_STATUS_TONE[c.status]}>{CAMPAIGN_STATUS_LABEL[c.status]}</StatusBadge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatThaiDate(c.startDate)} – {formatThaiDate(c.endDate)} · {activePosts} โพสต์ในแผน
          </p>
        </div>
        {canEdit && <CampaignFormDialog workspaceId={workspaceId} topicId={topicId} campaign={formValues} triggerLabel="แก้ไข" />}
      </header>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <div className="neu-pressed rounded-2xl border border-[var(--border)] p-3 text-xs" title={goal.explain}>
          <p className="text-muted-foreground">เป้าหมาย</p>
          <p className="font-semibold text-foreground">{goal.emoji} {goal.label}</p>
        </div>
        <div className="neu-pressed rounded-2xl border border-[var(--border)] p-3 text-xs" title={goal.explain}>
          <p className="text-muted-foreground">เป้า {goal.metric}</p>
          <p className="font-semibold text-foreground">
            {c.kpiTarget !== null ? `${c.kpiTarget.toLocaleString("th-TH")} ${goal.unit}` : "ยังไม่ตั้ง (Learning)"}
          </p>
        </div>
        <div className="neu-pressed rounded-2xl border border-[var(--border)] p-3 text-xs">
          <p className="text-muted-foreground">งบโฆษณา</p>
          <p className="font-semibold text-foreground">
            {c.budget !== null ? `${c.budget.toLocaleString("th-TH")} ${c.currency}` : "Organic (ไม่มีงบ)"}
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-bold text-muted-foreground">แผนโพสต์</h4>
        {canEdit && <PlannedPostFormDialog workspaceId={workspaceId} campaignId={c.id} triggerLabel="+ เพิ่มแผนโพสต์" />}
      </div>
      <PlannedPostList workspaceId={workspaceId} campaignId={c.id} rows={rows} canEdit={canEdit} />

      <footer className="mt-4 border-t border-[var(--border)] pt-3">
        <CampaignStatusActions
          workspaceId={workspaceId}
          campaignId={c.id}
          allowed={allowedCampaignTransitions(c.status, role)}
        />
      </footer>
    </article>
  );
}
