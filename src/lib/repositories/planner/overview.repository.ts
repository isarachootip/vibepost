import { prisma } from "@/lib/prisma";
import type { OverviewInput } from "@/lib/services/planner/planner-overview.service";

/** Batch-loads overview rows for many brands in 4 queries (no N+1). */
export async function loadOverviewInputs(
  workspaceIds: string[],
  now: Date
): Promise<Map<string, OverviewInput>> {
  const result = new Map<string, OverviewInput>(
    workspaceIds.map((id) => [id, { topics: [], campaigns: [], plannedPosts: [], unassignedPostCount: 0 }])
  );
  if (workspaceIds.length === 0) return result;

  const [topics, campaigns, plannedPosts, unassigned] = await Promise.all([
    prisma.contentTopic.findMany({
      where: { workspaceId: { in: workspaceIds } },
      select: { id: true, name: true, color: true, status: true, workspaceId: true },
    }),
    prisma.campaign.findMany({
      where: { topic: { workspaceId: { in: workspaceIds } }, status: { not: "ARCHIVED" } },
      select: { id: true, topicId: true, status: true, startDate: true, endDate: true, topic: { select: { workspaceId: true } } },
    }),
    prisma.plannedPost.findMany({
      where: {
        campaign: { topic: { workspaceId: { in: workspaceIds } }, status: { not: "ARCHIVED" } },
        OR: [{ slotAt: { gte: now } }, { status: "FAILED" }],
      },
      orderBy: { slotAt: "asc" },
      take: 500,
      select: {
        id: true, campaignId: true, angle: true, slotAt: true, status: true, platforms: true,
        campaign: { select: { topic: { select: { workspaceId: true } } } },
      },
    }),
    prisma.post.groupBy({
      by: ["workspaceId"],
      where: { workspaceId: { in: workspaceIds }, topicId: null, isDeleted: false },
      _count: { _all: true },
    }),
  ]);

  for (const { workspaceId, ...t } of topics) result.get(workspaceId)?.topics.push(t);
  for (const { topic, ...c } of campaigns) result.get(topic.workspaceId)?.campaigns.push(c);
  for (const { campaign, ...p } of plannedPosts) {
    result.get(campaign.topic.workspaceId)?.plannedPosts.push(p);
  }
  for (const row of unassigned) {
    const entry = result.get(row.workspaceId);
    if (entry) entry.unassignedPostCount = row._count._all;
  }
  return result;
}

export async function getWorkspaceName(workspaceId: string): Promise<string | null> {
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { name: true } });
  return ws?.name ?? null;
}

export async function listUnassignedPosts(workspaceId: string, limit = 20) {
  return prisma.post.findMany({
    where: { workspaceId, topicId: null, isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, content: true, status: true, createdAt: true, publishedTime: true },
  });
}

/** Sets (or clears) a post's topic. Both post and topic must belong to the workspace. */
export async function assignPostTopic(
  workspaceId: string,
  postId: string,
  topicId: string | null
): Promise<boolean> {
  if (topicId) {
    const ok = await prisma.contentTopic.count({ where: { id: topicId, workspaceId } });
    if (ok === 0) return false;
  }
  const res = await prisma.post.updateMany({ where: { id: postId, workspaceId }, data: { topicId } });
  return res.count > 0;
}
