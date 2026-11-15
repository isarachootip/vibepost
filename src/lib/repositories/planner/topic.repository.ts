import { prisma } from "@/lib/prisma";
import type { TopicInput } from "@/lib/validations/planner.schema";

// All queries are scoped by workspaceId so IDs from one brand can never touch another.

export async function listTopics(workspaceId: string) {
  return prisma.contentTopic.findMany({
    where: { workspaceId },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { posts: { where: { isDeleted: false } } } },
      campaigns: { select: { id: true, status: true } },
    },
  });
}

export async function getTopicDetail(workspaceId: string, topicId: string) {
  return prisma.contentTopic.findFirst({
    where: { id: topicId, workspaceId },
    include: {
      campaigns: {
        orderBy: { startDate: "desc" },
        include: { plannedPosts: { orderBy: { slotAt: "asc" } } },
      },
    },
  });
}

export async function topicBelongsToWorkspace(workspaceId: string, topicId: string): Promise<boolean> {
  const count = await prisma.contentTopic.count({ where: { id: topicId, workspaceId } });
  return count > 0;
}

export async function createTopic(input: TopicInput) {
  return prisma.contentTopic.create({ data: input, select: { id: true } });
}

export async function updateTopic(
  workspaceId: string,
  topicId: string,
  input: Omit<TopicInput, "workspaceId">
): Promise<boolean> {
  const res = await prisma.contentTopic.updateMany({
    where: { id: topicId, workspaceId },
    data: {
      ...input,
      audience: input.audience ?? null,
      sellingPoints: input.sellingPoints ?? null,
      forbidden: input.forbidden ?? null,
      tone: input.tone ?? null,
    },
  });
  return res.count > 0;
}

export async function setTopicStatus(
  workspaceId: string,
  topicId: string,
  status: "ACTIVE" | "ARCHIVED"
): Promise<boolean> {
  const res = await prisma.contentTopic.updateMany({ where: { id: topicId, workspaceId }, data: { status } });
  return res.count > 0;
}
