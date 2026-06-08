"use server";

import { prisma } from "@/lib/prisma";
import { getActiveWorkspaceContext } from "./workspace";
import { auth } from "@/auth";

export type MonitorChannel = {
  id: string;
  platform: string;
  accountName: string;
};

export type MonitorPost = {
  id: string;
  content: string;
  status: string;
  scheduledTime: Date | null;
  publishedTime: Date | null;
  errorMessage: string | null;
  images: { url: string }[];
  targetConnections: {
    id: string;
    socialConnectionId: string;
    status: string;
    errorMessage: string | null;
    reach: number;
    engagement: number;
    impressions: number;
    clicks: number;
    insightsSyncedAt: Date | null;
  }[];
};

export async function getMonitorData(
  startDateStr: string,
  endDateStr: string,
  workspaceId?: string
): Promise<{
  success: boolean;
  channels: MonitorChannel[];
  posts: MonitorPost[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    let targetWorkspaceId = workspaceId;
    if (!targetWorkspaceId) {
      const workspace = await getActiveWorkspaceContext();
      if (!workspace) return { success: true, channels: [], posts: [] };
      targetWorkspaceId = workspace.id;
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Get all active social connections/channels for the workspace
    const connections = await prisma.socialConnection.findMany({
      where: {
        workspaceId: targetWorkspaceId,
        isActive: true,
      },
      select: {
        id: true,
        platform: true,
        accountName: true,
      },
      orderBy: {
        platform: "asc",
      },
    });

    // Get posts scheduled/published within range
    const posts = await prisma.post.findMany({
      where: {
        workspaceId: targetWorkspaceId,
        isDeleted: false,
        OR: [
          {
            scheduledTime: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            publishedTime: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      include: {
        media: {
          include: {
            mediaAsset: {
              select: { fileUrl: true, fileType: true },
            },
          },
        },
        targets: {
          select: {
            id: true,
            socialConnectionId: true,
            status: true,
            errorMessage: true,
            reach: true,
            engagement: true,
            impressions: true,
            clicks: true,
            insightsSyncedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const formattedPosts: MonitorPost[] = posts.map((p) => ({
      id: p.id,
      content: p.content,
      status: p.status,
      scheduledTime: p.scheduledTime,
      publishedTime: p.publishedTime,
      errorMessage: p.errorMessage,
      images: p.media
        .filter((m) => m.mediaAsset.fileType === "IMAGE")
        .map((m) => ({ url: m.mediaAsset.fileUrl })),
      targetConnections: p.targets.map((t: any) => ({
        id: t.id,
        socialConnectionId: t.socialConnectionId,
        status: t.status,
        errorMessage: t.errorMessage,
        reach: t.reach || 0,
        engagement: t.engagement || 0,
        impressions: t.impressions || 0,
        clicks: t.clicks || 0,
        insightsSyncedAt: t.insightsSyncedAt,
      })),
    }));

    return {
      success: true,
      channels: connections,
      posts: formattedPosts,
    };
  } catch (error: any) {
    console.error("Monitor fetch error:", error);
    return { success: false, channels: [], posts: [], error: error.message };
  }
}
