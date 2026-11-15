"use client";

import { transitionCampaignAction } from "@/lib/actions/planner/campaign.actions";
import type { CampaignStatusValue } from "@/lib/services/planner/campaign-status.service";
import { usePlannerAction } from "@/hooks/use-planner-action";
import { Button } from "@/components/ui/button";
import { CAMPAIGN_TRANSITION_LABEL } from "./planner-labels";

interface Props {
  workspaceId: string;
  campaignId: string;
  /** Computed on the server from the caller's role; the server re-checks on submit. */
  allowed: CampaignStatusValue[];
}

export function CampaignStatusActions({ workspaceId, campaignId, allowed }: Props) {
  const { run, pending, error } = usePlannerAction();
  if (allowed.length === 0) return null;

  function go(to: CampaignStatusValue) {
    if (to === "ARCHIVED" && !confirm("ต้องการ Archive Campaign นี้หรือไม่? (กู้คืนได้ภายหลัง)")) return;
    run(() => transitionCampaignAction({ workspaceId, campaignId, to }));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {allowed.map((to) => (
        <Button
          key={to}
          size="sm"
          variant={to === "APPROVED" || to === "PENDING_APPROVAL" ? "tactile" : to === "ARCHIVED" ? "destructive" : "neu"}
          disabled={pending}
          onClick={() => go(to)}
        >
          {CAMPAIGN_TRANSITION_LABEL[to]}
        </Button>
      ))}
      {error && <span className="text-xs font-semibold text-destructive">{error}</span>}
    </div>
  );
}
