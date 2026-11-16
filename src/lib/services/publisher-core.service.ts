import type {
  ExecuteAutoPostOptions,
  ExecuteAutoPostResult,
  PublishablePost,
  PublishableTarget,
} from "./publisher-types";

export type { PublishablePost, PublishableTarget };

export interface PublisherStore {
  findDuePosts: (query: { now: Date; postId?: string }) => Promise<PublishablePost[]>;
  claimPost: (postId: string) => Promise<boolean>;
  markTargetPublished: (targetId: string, externalPostId: string) => Promise<void>;
  markTargetFailed: (targetId: string, errorMessage: string) => Promise<void>;
  concludePost: (
    postId: string,
    status: "PUBLISHED" | "FAILED",
    errorMessage: string | null,
    publishedAt: Date
  ) => Promise<void>;
}

export type TargetDispatcher = (
  post: PublishablePost,
  target: PublishableTarget
) => Promise<string>;

export interface RunPublisherSweepParams {
  options?: ExecuteAutoPostOptions;
  store: PublisherStore;
  dispatchTarget: TargetDispatcher;
  now?: Date;
}

export async function runPublisherSweep({
  options,
  store,
  dispatchTarget,
  now = new Date(),
}: RunPublisherSweepParams): Promise<ExecuteAutoPostResult> {
  try {
    const duePosts = await store.findDuePosts({ now, postId: options?.postId });
    if (duePosts.length === 0) {
      return { success: true, count: 0 };
    }

    let processedCount = 0;

    for (const post of duePosts) {
      // Atomic claim prevents concurrent cron / Post Now sweeps from double-publishing
      const claimed = await store.claimPost(post.id);
      if (!claimed) {
        continue;
      }

      const targetErrors: string[] = [];
      let anyTargetFailed = false;

      for (const target of post.targets) {
        // Idempotent guard: skip targets already marked PUBLISHED
        if (target.status === "PUBLISHED") {
          continue;
        }

        const conn = target.socialConnection;
        if (!conn.isActive) {
          const inactiveMsg = "ช่องทางโซเชียลถูกปิดใช้งาน (Inactive)";
          anyTargetFailed = true;
          targetErrors.push(`${conn.platform} (${conn.accountName}): ${inactiveMsg}`);
          await store.markTargetFailed(target.id, inactiveMsg);
          continue;
        }

        try {
          const externalPostId = await dispatchTarget(post, target);
          await store.markTargetPublished(target.id, externalPostId);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown publishing error";
          anyTargetFailed = true;
          targetErrors.push(`${conn.platform} (${conn.accountName}): ${message}`);
          await store.markTargetFailed(target.id, message);
        }
      }

      const finalStatus: "PUBLISHED" | "FAILED" = anyTargetFailed ? "FAILED" : "PUBLISHED";
      const summaryError = targetErrors.length > 0 ? targetErrors.join(" | ") : null;

      await store.concludePost(post.id, finalStatus, summaryError, new Date());
      processedCount++;
    }

    return { success: true, count: processedCount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Fatal publisher error";
    return { success: false, error: message };
  }
}
