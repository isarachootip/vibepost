import { prisma } from "@/lib/prisma";
import type { PlannedPostInput } from "@/lib/validations/planner.schema";
import type { PlannedPostStatusValue } from "@/lib/services/planner/planned-post-rules.service";

// Planned posts are scoped through campaign → topic → workspaceId.

export async function findPlannedPostInWorkspace(workspaceId: string, plannedPostId: string) {
  return prisma.plannedPost.findFirst({
    where: { id: plannedPostId, campaign: { topic: { workspaceId } } },
    select: {
      id: true,
      status: true,
      campaign: { select: { id: true, topicId: true, status: true, startDate: true, endDate: true } },
    },
  });
}

function toData(input: PlannedPostInput) {
  return {
    slotAt: input.slotAt,
    angle: input.angle,
    format: input.format,
    platforms: input.platforms,
    notes: input.notes ?? null,
  };
}

export async function createPlannedPost(input: PlannedPostInput) {
  return prisma.plannedPost.create({
    data: { ...toData(input), campaignId: input.campaignId },
    select: { id: true },
  });
}

export async function updatePlannedPost(plannedPostId: string, input: PlannedPostInput) {
  return prisma.plannedPost.update({
    where: { id: plannedPostId },
    data: toData(input),
    select: { id: true },
  });
}

export async function setPlannedPostStatus(plannedPostId: string, status: PlannedPostStatusValue) {
  return prisma.plannedPost.update({
    where: { id: plannedPostId },
    data: { status },
    select: { id: true },
  });
}
