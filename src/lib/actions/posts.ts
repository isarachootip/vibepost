"use server";

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
  }[];
};

export async function getPublishedPostsForLanding(): Promise<{
  posts: PublishedPostForGallery[];
  totalPosts: number;
  totalChannels: number;
}> {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedTime: "desc" },
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
          include: {
            socialConnection: {
              select: { platform: true, accountName: true },
            },
          },
        },
        workspace: { select: { name: true } },
      },
    });

    // Count unique platforms across all posts
    const platformSet = new Set<string>();
    posts.forEach((post) => {
      post.targets.forEach((t) =>
        platformSet.add(t.socialConnection.platform)
      );
    });

    const data: PublishedPostForGallery[] = posts.map((post) => ({
      id: post.id,
      content: post.content,
      publishedTime: post.publishedTime,
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

    return {
      posts: data,
      totalPosts: data.length,
      totalChannels: platformSet.size,
    };
  } catch {
    return { posts: [], totalPosts: 0, totalChannels: 0 };
  }
}
