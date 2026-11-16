import { prisma } from "@/lib/prisma";
import type {
  ExecuteAutoPostOptions,
  ExecuteAutoPostResult,
  PublishablePost,
  PublishableTarget,
} from "./publisher-types";
import { runPublisherSweep, type PublisherStore } from "./publisher-core.service";
import { publishToFacebook, publishToInstagram } from "./providers/meta-publisher.service";
import { publishToTikTok, publishToYouTube } from "./providers/video-platforms.service";

async function dispatchPlatformTarget(
  post: PublishablePost,
  target: PublishableTarget
): Promise<string> {
  const conn = target.socialConnection;
  console.log(`[Publisher] -> Target: ${conn.platform} (${conn.accountName})`);

  switch (conn.platform) {
    case "FACEBOOK":
      return publishToFacebook(post, conn);
    case "INSTAGRAM":
      return publishToInstagram(post, conn);
    case "TIKTOK":
      return publishToTikTok(post, conn);
    case "YOUTUBE":
      return publishToYouTube(post, conn);
    default:
      throw new Error(`Platform ${conn.platform} not yet implemented.`);
  }
}

const prismaPublisherStore: PublisherStore = {
  async findDuePosts({ now, postId }) {
    return prisma.post.findMany({
      where: {
        status: "SCHEDULED",
        isDeleted: false,
        ...(postId ? { id: postId } : { scheduledTime: { lte: now } }),
      },
      include: {
        media: {
          include: {
            mediaAsset: {
              select: { fileType: true, fileUrl: true },
            },
          },
        },
        targets: {
          include: {
            socialConnection: {
              select: {
                id: true,
                platform: true,
                accountId: true,
                accountName: true,
                accessToken: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
  },

  async claimPost(postId) {
    const claimed = await prisma.post.updateMany({
      where: { id: postId, status: "SCHEDULED" },
      data: { status: "PUBLISHING" },
    });
    return claimed.count === 1;
  },

  async markTargetPublished(targetId, externalPostId) {
    await prisma.postTarget.update({
      where: { id: targetId },
      data: { status: "PUBLISHED", externalPostId, errorMessage: null },
    });
  },

  async markTargetFailed(targetId, errorMessage) {
    await prisma.postTarget.update({
      where: { id: targetId },
      data: { status: "FAILED", errorMessage },
    });
  },

  async concludePost(postId, status, errorMessage, publishedAt) {
    await prisma.post.update({
      where: { id: postId },
      data: {
        status,
        errorMessage,
        publishedTime: publishedAt,
      },
    });
    await prisma.plannedPost.updateMany({
      where: { postId },
      data: { status },
    });
  },
};

export async function executeAutoPost(
  options?: ExecuteAutoPostOptions
): Promise<ExecuteAutoPostResult> {
  console.log(`[Publisher] Sweep started at ${new Date().toISOString()}`);
  const result = await runPublisherSweep({
    options,
    store: prismaPublisherStore,
    dispatchTarget: dispatchPlatformTarget,
  });
  if (!result.success) {
    console.error(`[Publisher] Sweep failed: ${result.error}`);
  } else {
    console.log(`[Publisher] Sweep completed. Processed ${result.count ?? 0} post(s).`);
  }
  return result;
}
