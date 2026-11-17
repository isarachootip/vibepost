import { prisma } from "@/lib/prisma";
import {
  curateShowcaseFeed,
  type RawShowcasePost,
} from "@/lib/services/showcase-visibility.service";

export type PublishedPostForGallery = {
  id: string;
  content: string;
  publishedTime: Date | null;
  workspace: string;
  workspaceShowOnLanding?: boolean;
  showOnLanding?: boolean;
  isPinnedOnLanding?: boolean;
  effectivelyVisible?: boolean;
  images: { url: string; fileName: string; type?: string }[];
  channels: {
    platform: string;
    accountName: string;
    status: string;
    externalPostId?: string | null;
  }[];
};

export interface LandingShowcasePayload {
  posts: PublishedPostForGallery[];
  totalPosts: number;
  totalChannels: number;
  totalSuccessfulReposts: number;
  uniquePlatforms: string[];
  hiddenCount: number;
}

export async function fetchPublishedPostsForLanding(options?: {
  includeHidden?: boolean;
}): Promise<LandingShowcasePayload> {
  try {
    const showcaseIds = (process.env.PUBLIC_SHOWCASE_WORKSPACE_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const rows = await prisma.post.findMany({
      where: {
        isDeleted: false,
        targets: {
          some: { status: "PUBLISHED" },
        },
      },
      orderBy: [
        { isPinnedOnLanding: "desc" },
        { publishedTime: "desc" },
        { createdAt: "desc" },
      ],
      take: 100,
      include: {
        media: {
          include: {
            mediaAsset: {
              select: { fileUrl: true, fileType: true, fileName: true },
            },
          },
        },
        targets: {
          where: { status: "PUBLISHED" },
          include: {
            socialConnection: {
              select: { platform: true, accountName: true },
            },
          },
        },
        workspace: {
          select: { id: true, name: true, showOnLanding: true },
        },
      },
    });

    const rawPosts: RawShowcasePost[] = rows.map((post) => ({
      id: post.id,
      workspaceId: post.workspace.id,
      workspaceName: post.workspace.name,
      workspaceShowOnLanding: post.workspace.showOnLanding,
      content: post.content,
      publishedTime: post.publishedTime || post.createdAt,
      showOnLanding: post.showOnLanding,
      isPinnedOnLanding: post.isPinnedOnLanding,
      images: post.media.map((m) => ({
        url: m.mediaAsset.fileUrl,
        fileName: m.mediaAsset.fileName,
        type: m.mediaAsset.fileType === "VIDEO" ? "video" : "image",
      })),
      channels: post.targets.map((t) => ({
        platform: t.socialConnection.platform,
        accountName: t.socialConnection.accountName,
        status: t.status,
        externalPostId: t.externalPostId,
      })),
    }));

    const curated = curateShowcaseFeed(rawPosts, {
      includeHidden: options?.includeHidden ?? false,
      allowlistWorkspaceIds: showcaseIds,
    });

    const posts: PublishedPostForGallery[] = curated.posts.slice(0, 60).map((p) => ({
      id: p.id,
      content: p.content,
      publishedTime: p.publishedTime,
      workspace: p.workspaceName,
      workspaceShowOnLanding: p.workspaceShowOnLanding,
      showOnLanding: p.showOnLanding,
      isPinnedOnLanding: p.isPinnedOnLanding,
      effectivelyVisible: p.effectivelyVisible,
      images: p.images,
      channels: p.channels,
    }));

    return {
      posts,
      totalPosts: curated.heroStats.totalPosts,
      totalChannels: curated.heroStats.totalChannels,
      totalSuccessfulReposts: curated.heroStats.totalSuccessfulReposts,
      uniquePlatforms: curated.heroStats.uniquePlatforms,
      hiddenCount: curated.hiddenCount,
    };
  } catch {
    return {
      posts: [],
      totalPosts: 0,
      totalChannels: 0,
      totalSuccessfulReposts: 0,
      uniquePlatforms: [],
      hiddenCount: 0,
    };
  }
}
