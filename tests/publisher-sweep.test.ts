import assert from "node:assert/strict";
import { automationActionSchema } from "../src/lib/validations/automation.schema";
import { filterPublicMediaUrls } from "../src/lib/services/publisher-types";
import {
  runPublisherSweep,
  type PublishablePost,
  type PublishableTarget,
  type PublisherStore,
} from "../src/lib/services/publisher-core.service";
import { createSchedulerController } from "../src/lib/services/scheduler.service";

function makeTarget(
  id: string,
  platform: string,
  accountName: string,
  opts: { status?: string; isActive?: boolean } = {}
): PublishableTarget {
  return {
    id,
    status: opts.status ?? "SCHEDULED",
    socialConnection: {
      id: `sc-${id}`,
      platform,
      accountId: `acc-${id}`,
      accountName,
      accessToken: `tok-${id}`,
      isActive: opts.isActive ?? true,
    },
  };
}

export async function runPublisherSweepTests(): Promise<void> {
  // 1. Zod validation for /api/automation actions
  {
    assert.equal(automationActionSchema.safeParse({ action: "trigger" }).success, true);
    assert.equal(automationActionSchema.safeParse({ action: "disable" }).success, true);
    const upd = automationActionSchema.safeParse({ action: "update", intervalMinutes: "15" });
    assert.equal(upd.success, true);
    if (upd.success && upd.data.action === "update") {
      assert.equal(upd.data.intervalMinutes, 15);
    }
    assert.equal(automationActionSchema.safeParse({ action: "update", intervalMinutes: 0 }).success, false);
    assert.equal(automationActionSchema.safeParse({ action: "update", intervalMinutes: 99 }).success, false);
    assert.equal(automationActionSchema.safeParse({ action: "unknown" }).success, false);
  }

  // 2. Public media URL filtering excludes localhost/blob and matches fileType
  {
    const urls = filterPublicMediaUrls(
      [
        { mediaAsset: { fileType: "IMAGE", fileUrl: "https://vibepost.online/api/files/pic1.jpg" } },
        { mediaAsset: { fileType: "IMAGE", fileUrl: "http://localhost:3000/api/files/dev.jpg" } },
        { mediaAsset: { fileType: "IMAGE", fileUrl: "blob:https://vibepost.online/1234" } },
        { mediaAsset: { fileType: "VIDEO", fileUrl: "https://vibepost.online/api/files/reel.mp4" } },
      ],
      "IMAGE"
    );
    assert.deepEqual(urls, ["https://vibepost.online/api/files/pic1.jpg"]);
  }

  // 3. Atomic claim prevents concurrent sweeps from double-posting the same post
  {
    const claimedIds = new Set<string>();
    const dispatchedTargets: string[] = [];
    const samplePost: PublishablePost = {
      id: "post-1",
      content: "Hello world",
      media: [{ mediaAsset: { fileType: "IMAGE", fileUrl: "https://vibepost.online/api/files/a.jpg" } }],
      targets: [makeTarget("t-fb", "FACEBOOK", "One - Dish Meals")],
    };

    const store: PublisherStore = {
      findDuePosts: async () => [samplePost],
      claimPost: async (postId) => {
        if (claimedIds.has(postId)) return false;
        claimedIds.add(postId);
        return true;
      },
      markTargetPublished: async () => {},
      markTargetFailed: async () => {},
      concludePost: async () => {},
    };

    const [sweepA, sweepB] = await Promise.all([
      runPublisherSweep({
        store,
        dispatchTarget: async (_post, target) => {
          dispatchedTargets.push(target.id);
          return "fb_post_999";
        },
      }),
      runPublisherSweep({
        store,
        dispatchTarget: async (_post, target) => {
          dispatchedTargets.push(target.id);
          return "fb_post_duplicate";
        },
      }),
    ]);

    assert.equal((sweepA.count ?? 0) + (sweepB.count ?? 0), 1);
    assert.deepEqual(dispatchedTargets, ["t-fb"]);
  }

  // 4. Skips already-PUBLISHED targets, fails inactive connections, and aggregates errorMessage
  {
    const publishedUpdates: Array<{ targetId: string; externalPostId: string }> = [];
    const failedUpdates: Array<{ targetId: string; errorMessage: string }> = [];
    const concludedPosts: Array<{ postId: string; status: "PUBLISHED" | "FAILED"; errorMessage: string | null }> = [];

    const mixedPost: PublishablePost = {
      id: "post-mixed",
      content: "Mixed targets test",
      media: [],
      targets: [
        makeTarget("t-already-done", "FACEBOOK", "Done Page", { status: "PUBLISHED" }),
        makeTarget("t-fb-live", "FACEBOOK", "ครัวคุณแหม่มซอย8"),
        makeTarget("t-ig-bad", "INSTAGRAM", "ODM"),
        makeTarget("t-inactive", "TIKTOK", "Disabled TikTok", { isActive: false }),
      ],
    };

    const store: PublisherStore = {
      findDuePosts: async ({ postId }) => (postId === "post-mixed" ? [mixedPost] : []),
      claimPost: async () => true,
      markTargetPublished: async (targetId, externalPostId) => {
        publishedUpdates.push({ targetId, externalPostId });
      },
      markTargetFailed: async (targetId, errorMessage) => {
        failedUpdates.push({ targetId, errorMessage });
      },
      concludePost: async (postId, status, errorMessage) => {
        concludedPosts.push({ postId, status, errorMessage });
      },
    };

    const dispatched: string[] = [];
    const res = await runPublisherSweep({
      options: { postId: "post-mixed" },
      store,
      dispatchTarget: async (_post, target) => {
        dispatched.push(target.id);
        if (target.id === "t-ig-bad") throw new Error("Invalid OAuth access token");
        return "fb_ok_123";
      },
    });

    assert.equal(res.success, true);
    assert.equal(res.count, 1);
    assert.deepEqual(dispatched, ["t-fb-live", "t-ig-bad"]);
    assert.deepEqual(publishedUpdates, [{ targetId: "t-fb-live", externalPostId: "fb_ok_123" }]);
    assert.equal(failedUpdates.length, 2);
    assert.equal(concludedPosts[0]?.status, "FAILED");
    assert.ok(concludedPosts[0]?.errorMessage?.includes("Invalid OAuth access token"));
  }

  // 5. In-process scheduler controller manages manual trigger, interval update, and disable
  {
    let sweeps = 0;
    const controller = createSchedulerController(async () => {
      sweeps++;
      return { success: true, count: 2 };
    });

    const trig = await controller.triggerManual();
    assert.equal(trig.success, true);
    assert.equal(sweeps, 1);

    controller.updateInterval(10);
    const statusAfterUpdate = controller.getStatus();
    assert.equal(statusAfterUpdate.isActive, true);
    assert.equal(statusAfterUpdate.intervalMinutes, 10);
    assert.ok(statusAfterUpdate.recentLogs.some((l) => l.includes("Processed 2 posts")));

    controller.disable();
    assert.equal(controller.getStatus().isActive, false);
  }

  console.log("  ✓ publisher-sweep.test.ts passed (5 assertions)");
}
