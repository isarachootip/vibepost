import Link from "next/link";
import type { BrandSummary } from "@/lib/services/planner/planner-overview.service";
import { PLANNED_STATUS_LABEL, PLANNED_STATUS_TONE } from "./planner-labels";
import { StatusBadge, formatThaiDate } from "./planner-ui";

interface Props {
  workspaceId: string;
  name: string;
  summary: BrandSummary;
}

function Stat({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="neu-pressed rounded-2xl border border-[var(--border)] px-3 py-2">
      <div className={`font-display text-xl ${alert && value > 0 ? "text-destructive" : "text-foreground"}`}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

export function BrandOverviewCard({ workspaceId, name, summary }: Props) {
  return (
    <Link
      href={`/dashboard/planner/${workspaceId}`}
      className="neu-raised neu-grain group flex flex-col gap-4 rounded-3xl border border-[var(--border)] p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg text-foreground">{name}</h2>
        {summary.pendingApprovals > 0 && (
          <StatusBadge tone="warn">รออนุมัติ {summary.pendingApprovals}</StatusBadge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Topic" value={summary.activeTopics} />
        <Stat label="Campaign ที่รันอยู่" value={summary.runningCampaigns} />
        <Stat label="ล้มเหลว" value={summary.failedPosts} alert />
        <Stat label="ยังไม่จัดหมวด" value={summary.unassignedPosts} />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-muted-foreground">โพสต์ถัดไป</p>
        {summary.upcoming.length === 0 ? (
          <p className="text-xs text-muted-foreground">ยังไม่มีแผนโพสต์ที่กำลังจะถึง</p>
        ) : (
          <ul className="space-y-1.5">
            {summary.upcoming.map((u) => (
              <li key={u.id} className="flex items-center gap-2 text-xs">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: u.topicColor }} />
                <span className="w-24 shrink-0 text-muted-foreground">{formatThaiDate(u.slotAt, true)}</span>
                <span className="truncate text-foreground">
                  <b>{u.topicName}</b> · {u.angle}
                </span>
                <span className="ml-auto">
                  <StatusBadge tone={PLANNED_STATUS_TONE[u.status]}>{PLANNED_STATUS_LABEL[u.status]}</StatusBadge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
