import assert from "node:assert/strict";
import {
  startVeoJobSchema,
  updateDailyVideoQuotaSchema,
} from "../src/lib/validations/veo-video.schema";
import {
  getBangkokDayRange,
  evaluateDailyVideoQuota,
} from "../src/lib/services/veo-quota.service";
import {
  resolveVeoModelId,
  estimateVeoClipCostUsd,
  startVeoLongRunningOperation,
  checkVeoOperationState,
} from "../src/lib/services/veo-client.service";
import {
  advanceProcessingVeoJobs,
  type ProcessingJobRecord,
  type VeoJobPollerStore,
} from "../src/lib/services/veo-job-poller.service";

export async function runVeoFlowTests(): Promise<void> {
  // 1. Zod schema defaults & strict constraints (rejects 1:1 aspect ratio)
  {
    const def = startVeoJobSchema.safeParse({ prompt: "Thai street food sizzling wok" });
    assert.equal(def.success, true);
    if (def.success) {
      assert.equal(def.data.modelTier, "FAST");
      assert.equal(def.data.aspectRatio, "9:16");
      assert.equal(def.data.durationSeconds, 6);
    }
    assert.equal(startVeoJobSchema.safeParse({ prompt: "x", aspectRatio: "1:1" }).success, false);
    assert.equal(startVeoJobSchema.safeParse({ prompt: "x", durationSeconds: 5 }).success, false);
    assert.equal(updateDailyVideoQuotaSchema.safeParse({ dailyVideoQuota: "10" }).success, true);
    assert.equal(updateDailyVideoQuotaSchema.safeParse({ dailyVideoQuota: -1 }).success, false);
  }

  // 2. Bangkok midnight reset window & daily quota guard
  {
    const { start, end } = getBangkokDayRange(new Date("2026-11-17T23:30:00+07:00"));
    assert.equal(start.toISOString(), "2026-11-16T17:00:00.000Z");
    assert.equal(end.toISOString(), "2026-11-17T17:00:00.000Z");

    const allowed = evaluateDailyVideoQuota(4, 5);
    assert.equal(allowed.allowed, true);
    assert.equal(allowed.remaining, 1);
    assert.equal(evaluateDailyVideoQuota(5, 5).allowed, false);
  }

  // 3. Model resolution, header auth (no ?key= leak), Image-to-Video payload, and Fail-Honest error
  {
    assert.equal(resolveVeoModelId("FAST"), "veo-3.1-fast-generate-preview");
    assert.equal(resolveVeoModelId("STANDARD"), "veo-3.1-generate-preview");
    assert.ok(estimateVeoClipCostUsd("STANDARD", 8) > estimateVeoClipCostUsd("FAST", 8));

    let capturedUrl = "";
    let capturedHeaders: Record<string, string> = {};
    let capturedBody = "";

    const op = await startVeoLongRunningOperation({
      apiKey: "secret-gemini-key",
      modelName: "veo-3.1-fast-generate-preview",
      englishPrompt: "Cinematic slow motion pour of Thai iced tea",
      aspectRatio: "9:16",
      durationSeconds: 6,
      sourceImage: { base64Bytes: "IMG_B64", mimeType: "image/jpeg" },
      fetchFn: (async (url: string | URL | Request, init?: RequestInit) => {
        capturedUrl = String(url);
        capturedHeaders = (init?.headers ?? {}) as Record<string, string>;
        capturedBody = String(init?.body ?? "");
        return new Response(JSON.stringify({ name: "models/veo/operations/op-123" }), { status: 200 });
      }) as typeof fetch,
    });

    assert.equal(op.operationName, "models/veo/operations/op-123");
    assert.ok(!capturedUrl.includes("secret-gemini-key"));
    assert.equal(capturedHeaders["x-goog-api-key"], "secret-gemini-key");
    const parsedBody = JSON.parse(capturedBody) as {
      instances: Array<{ prompt: string; image?: { bytesBase64Encoded: string } }>;
      parameters: { aspectRatio: string; durationSeconds: number };
    };
    assert.equal(parsedBody.instances[0]?.image?.bytesBase64Encoded, "IMG_B64");
    assert.equal(parsedBody.parameters.aspectRatio, "9:16");
    assert.equal(parsedBody.parameters.durationSeconds, 6);

    await assert.rejects(
      () =>
        startVeoLongRunningOperation({
          apiKey: "bad-key",
          modelName: "veo-3.1-fast-generate-preview",
          englishPrompt: "Test",
          aspectRatio: "16:9",
          durationSeconds: 4,
          fetchFn: (async () =>
            new Response(
              JSON.stringify({ error: { message: "Veo quota exceeded" } }),
              { status: 429 }
            )) as typeof fetch,
        }),
      /Veo quota exceeded/
    );
  }

  // 4. Operation polling handles PROCESSING, COMPLETED, and RAI safety filter
  {
    const pending = await checkVeoOperationState({
      apiKey: "k",
      operationName: "operations/1",
      fetchFn: (async () => new Response(JSON.stringify({ done: false }), { status: 200 })) as typeof fetch,
    });
    assert.equal(pending.status, "PROCESSING");

    const doneOk = await checkVeoOperationState({
      apiKey: "k",
      operationName: "operations/2",
      fetchFn: (async () =>
        new Response(
          JSON.stringify({
            done: true,
            response: {
              generateVideoResponse: {
                generatedSamples: [{ video: { uri: "https://generativelanguage.googleapis.com/v1beta/files/v1:download?alt=media" } }],
              },
            },
          }),
          { status: 200 }
        )) as typeof fetch,
    });
    assert.equal(doneOk.status, "COMPLETED");

    const safetyBlocked = await checkVeoOperationState({
      apiKey: "k",
      operationName: "operations/3",
      fetchFn: (async () =>
        new Response(
          JSON.stringify({
            done: true,
            response: {
              generateVideoResponse: { raiMediaFilteredReasons: ["Likeness policy"] },
            },
          }),
          { status: 200 }
        )) as typeof fetch,
    });
    assert.equal(safetyBlocked.status, "FAILED");
  }

  // 5. Poller finalizes completed jobs and marks failed jobs without stock fallback
  {
    const completedIds: string[] = [];
    const failedMessages: string[] = [];
    const jobs: ProcessingJobRecord[] = [
      { id: "job-ok", workspaceId: "ws-1", operationName: "ops/ok", modelName: "veo", estimatedCost: 0.9 },
      { id: "job-fail", workspaceId: "ws-1", operationName: "ops/fail", modelName: "veo", estimatedCost: 0.9 },
    ];
    const store: VeoJobPollerStore = {
      listProcessingJobs: async () => jobs,
      getWorkspaceGeminiKey: async () => "gem-key",
      completeJobWithMedia: async ({ jobId }) => {
        completedIds.push(jobId);
      },
      failJob: async (_jobId, reason) => {
        failedMessages.push(reason);
      },
    };

    await advanceProcessingVeoJobs({
      store,
      checkOperation: async ({ operationName }) =>
        operationName.endsWith("ok")
          ? { status: "COMPLETED", videoUri: "https://example.com/v.mp4" }
          : { status: "FAILED", errorMessage: "Safety filter triggered" },
      downloadVideoToUploads: async () => ({
        fileName: "veo-123.mp4",
        publicUrl: "https://vibepost.online/api/files/veo-123.mp4",
      }),
    });

    assert.deepEqual(completedIds, ["job-ok"]);
    assert.deepEqual(failedMessages, ["Safety filter triggered"]);
  }

  console.log("  ✓ veo-flow.test.ts passed (5 assertions)");
}
