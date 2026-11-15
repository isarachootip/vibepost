import Link from "next/link";
import type { CampaignStatusValue } from "@/lib/services/planner/campaign-status.service";
import { StatusBadge } from "./planner-ui";

interface Props {
  href: string;
  name: string;
  color: string;
  archived: boolean;
  keywords: string[];
  postCount: number;
  campaignStatuses: CampaignStatusValue[];
}

export function TopicCard({ href, name, color, archived, keywords, postCount, campaignStatuses }: Props) {
  const running = campaignStatuses.filter((s) => s === "ACTIVE" || s === "APPROVED").length;
  const pending = campaignStatuses.filter((s) => s === "PENDING_APPROVAL").length;

  return (
    <Link
      href={href}
      className={`neu-raised flex flex-col gap-3 rounded-3xl border border-[var(--border)] p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 ${archived ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-2">
        <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="font-display text-base text-foreground">{name}</h3>
        {archived && <StatusBadge tone="neutral">Archive</StatusBadge>}
      </div>
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {keywords.slice(0, 5).map((k) => (
            <span key={k} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              #{k}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto flex flex-wrap gap-1.5 text-[11px]">
        <StatusBadge tone="neutral">{postCount} โพสต์</StatusBadge>
        <StatusBadge tone={running > 0 ? "success" : "neutral"}>{running} Campaign ที่รัน</StatusBadge>
        {pending > 0 && <StatusBadge tone="warn">รออนุมัติ {pending}</StatusBadge>}
      </div>
    </Link>
  );
}
