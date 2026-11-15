import { prisma } from "@/lib/prisma";
import type { CampaignInput } from "@/lib/validations/planner.schema";
import type { CampaignStatusValue } from "@/lib/services/planner/campaign-status.service";

// Campaigns are scoped through their topic's workspaceId.

export async function findCampaignInWorkspace(workspaceId: string, campaignId: string) {
  return prisma.campaign.findFirst({
    where: { id: campaignId, topic: { workspaceId } },
    select: { id: true, topicId: true, status: true, startDate: true, endDate: true },
  });
}

export async function createCampaign(input: CampaignInput) {
  const { workspaceId: _ws, ...data } = input;
  void _ws;
  return prisma.campaign.create({
    data: { ...data, kpiSource: "MANUAL" },
    select: { id: true },
  });
}

export async function updateCampaign(campaignId: string, input: CampaignInput) {
  return prisma.campaign.update({
    where: { id: campaignId },
    data: {
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      goal: input.goal,
      kpiTarget: input.kpiTarget ?? null,
      budget: input.budget ?? null,
      currency: input.currency,
      kpiSource: "MANUAL",
    },
    select: { id: true },
  });
}

export async function setCampaignStatus(
  campaignId: string,
  status: CampaignStatusValue,
  approvedById: string | null
) {
  const approval =
    status === "APPROVED"
      ? { approvedById, approvedAt: new Date() }
      : status === "DRAFT"
        ? { approvedById: null, approvedAt: null }
        : {};
  return prisma.campaign.update({
    where: { id: campaignId },
    data: { status, ...approval },
    select: { id: true, topicId: true },
  });
}
