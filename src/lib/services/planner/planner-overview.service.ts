// Pure aggregation for the Planner overview cards. No Prisma / Next imports.
import { isSlotWithinCampaign, type PlannedPostStatusValue } from "./planned-post-rules.service";
import type { CampaignStatusValue } from "./campaign-status.service";

export interface OverviewTopicRow {
  id: string;
  name: string;
  color: string;
  status: "ACTIVE" | "ARCHIVED";
}

export interface OverviewCampaignRow {
  id: string;
  topicId: string;
  status: CampaignStatusValue;
  startDate: Date;
  endDate: Date;
}

export interface OverviewPlannedRow {
  id: string;
  campaignId: string;
  angle: string;
  slotAt: Date;
  status: PlannedPostStatusValue;
  platforms: string[];
}

export interface OverviewInput {
  topics: OverviewTopicRow[];
  campaigns: OverviewCampaignRow[];
  plannedPosts: OverviewPlannedRow[];
  unassignedPostCount: number;
}

export interface UpcomingItem {
  id: string;
  angle: string;
  slotAt: Date;
  status: PlannedPostStatusValue;
  platforms: string[];
  topicId: string;
  topicName: string;
  topicColor: string;
}

export interface BrandSummary {
  activeTopics: number;
  runningCampaigns: number;
  pendingApprovals: number;
  failedPosts: number;
  unassignedPosts: number;
  upcoming: UpcomingItem[];
}

const UPCOMING_LIMIT = 5;
const NOT_UPCOMING: ReadonlySet<PlannedPostStatusValue> = new Set(["FAILED", "SKIPPED", "PUBLISHED"]);
const CLOSED_CAMPAIGN: ReadonlySet<CampaignStatusValue> = new Set(["ARCHIVED", "COMPLETED"]);

export function isCampaignRunning(c: OverviewCampaignRow, now: Date): boolean {
  if (c.status === "ACTIVE") return true;
  return c.status === "APPROVED" && isSlotWithinCampaign(now, c);
}

export function buildBrandSummary(input: OverviewInput, now: Date): BrandSummary {
  const topicById = new Map(input.topics.map((t) => [t.id, t]));
  const campaignById = new Map(input.campaigns.map((c) => [c.id, c]));

  const upcoming: UpcomingItem[] = [];
  for (const p of input.plannedPosts) {
    const campaign = campaignById.get(p.campaignId);
    const topic = campaign ? topicById.get(campaign.topicId) : undefined;
    if (!campaign || !topic || topic.status === "ARCHIVED") continue;
    if (CLOSED_CAMPAIGN.has(campaign.status) || NOT_UPCOMING.has(p.status)) continue;
    if (p.slotAt.getTime() < now.getTime()) continue;
    upcoming.push({ ...p, topicId: topic.id, topicName: topic.name, topicColor: topic.color });
  }
  upcoming.sort((a, b) => a.slotAt.getTime() - b.slotAt.getTime());

  const liveCampaignIds = new Set(
    input.campaigns.filter((c) => c.status !== "ARCHIVED").map((c) => c.id)
  );

  return {
    activeTopics: input.topics.filter((t) => t.status === "ACTIVE").length,
    runningCampaigns: input.campaigns.filter((c) => isCampaignRunning(c, now)).length,
    pendingApprovals: input.campaigns.filter((c) => c.status === "PENDING_APPROVAL").length,
    failedPosts: input.plannedPosts.filter(
      (p) => p.status === "FAILED" && liveCampaignIds.has(p.campaignId)
    ).length,
    unassignedPosts: input.unassignedPostCount,
    upcoming: upcoming.slice(0, UPCOMING_LIMIT),
  };
}
