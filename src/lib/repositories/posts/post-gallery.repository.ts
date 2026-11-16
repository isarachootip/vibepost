import { prisma } from "@/lib/prisma";

export type PublishedPostForGallery = {
  id: string;
  content: string;
  publishedTime: Date | null;
  workspace: string;
  images: { url: string; fileName: string }[];
  channels: {
    platform: string;
    accountName: string;
    status: string;
    externalPostId?: string | null;
  }[];
};

export async function fetchPublishedPostsForLanding(): Promise<{
  posts: PublishedPostForGallery[];
  totalPosts: number;
  totalChannels: number;
}> {
  try {
    const showcaseIds = (process.env.PUBLIC_SHOWCASE_WORKSPACE_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const posts = await prisma.post.findMany({
      where: {
        isDeleted: false,
        ...(showcaseIds.length ? { workspaceId: { in: showcaseIds } } : {}),
        targets: {
          some: {
            status: "PUBLISHED",
          },
        },
      },
      orderBy: [{ publishedTime: "desc" }, { createdAt: "desc" }],
      take: 60,
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
        workspace: { select: { name: true } },
      },
    });

    const data: PublishedPostForGallery[] = posts.map((post) => ({
      id: post.id,
      content: post.content,
      publishedTime: post.publishedTime || post.createdAt,
      workspace: post.workspace.name,
      images: post.media
        .filter((m) => m.mediaAsset.fileType === "IMAGE")
        .map((m) => ({
          url: m.mediaAsset.fileUrl,
          fileName: m.mediaAsset.fileName,
        })),
      channels: post.targets.map((t) => ({
        platform: t.socialConnection.platform,
        accountName: t.socialConnection.accountName,
        status: t.status,
        externalPostId: t.externalPostId,
      })),
    }));

    const platformSet = new Set<string>();
    data.forEach((post) => {
      post.channels.forEach((c) => platformSet.add(c.platform));
    });

    return {
      posts: data,
      totalPosts: data.length,
      totalChannels: platformSet.size,
    };
  } catch {
    return { posts: [], totalPosts: 0, totalChannels: 0 };
  }
}

export async function fetchTrashPostsForWorkspace(workspaceId: string): Promise<{
  posts: PublishedPostForGallery[];
  totalPosts: number;
}> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        workspaceId,
        isDeleted: true,
      },
      orderBy: { updatedAt: "desc" },
      include: {
        media: {
          include: {
            mediaAsset: {
              select: { fileUrl: true, fileType: true, fileName: true },
            },
          },
        },
        targets: {
          include: {
            socialConnection: {
              select: { platform: true, accountName: true },
            },
          },
        },
        workspace: { select: { name: true } },
      },
    });

    const data: PublishedPostForGallery[] = posts.map((post) => ({
      id: post.id,
      content: post.content,
      publishedTime: post.publishedTime || post.updatedAt,
      workspace: post.workspace.name,
      images: post.media
        .filter((m) => m.mediaAsset.fileType === "IMAGE")
        .map((m) => ({
          url: m.mediaAsset.fileUrl,
          fileName: m.mediaAsset.fileName,
        })),
      channels: post.targets.map((t) => ({
        platform: t.socialConnection.platform,
        accountName: t.socialConnection.accountName,
        status: t.status,
      })),
    }));

    return { posts: data, totalPosts: data.length };
  } catch {
    return { posts: [], totalPosts: 0 };
  }
}
