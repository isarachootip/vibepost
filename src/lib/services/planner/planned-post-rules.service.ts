// Pure domain rules for Planned Posts. No Prisma / Next imports.

export type PlannedPostStatusValue =
  | "IDEA"
  | "APPROVED"
  | "GENERATED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "FAILED"
  | "SKIPPED";

const LOCKED: ReadonlySet<PlannedPostStatusValue> = new Set(["SCHEDULED", "PUBLISHED"]);
const DAY_MS = 24 * 60 * 60 * 1000;

/** Once a post is scheduled/published, edits must happen on the Post itself. */
export function isPlannedPostLocked(status: PlannedPostStatusValue): boolean {
  return LOCKED.has(status);
}

interface CampaignWindow {
  startDate: Date;
  endDate: Date;
}

/** Slot must be on/after start and before the end of the campaign's last day. */
export function isSlotWithinCampaign(slotAt: Date, campaign: CampaignWindow): boolean {
  const t = slotAt.getTime();
  return t >= campaign.startDate.getTime() && t < campaign.endDate.getTime() + DAY_MS;
}
