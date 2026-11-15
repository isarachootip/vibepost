import assert from "node:assert/strict";
import { buildBrandSummary } from "../src/lib/services/planner/planner-overview.service";
import {
  bangkokDateToIso,
  bangkokDateTimeToIso,
  toBangkokDateInput,
  toBangkokDateTimeInput,
} from "../src/lib/services/planner/bangkok-time";

export async function runPlannerOverviewTests(): Promise<void> {
  const now = new Date("2026-11-15T03:00:00Z");
  const d = (iso: string): Date => new Date(iso);

  const summary = buildBrandSummary(
    {
      topics: [
        { id: "t1", name: "ยาง", color: "#111111", status: "ACTIVE" },
        { id: "t2", name: "แบต", color: "#222222", status: "ACTIVE" },
        { id: "t3", name: "เก่า", color: "#333333", status: "ARCHIVED" },
      ],
      campaigns: [
        { id: "c1", topicId: "t1", status: "ACTIVE", startDate: d("2026-11-01"), endDate: d("2026-12-31") },
        // APPROVED and inside its window counts as running
        { id: "c2", topicId: "t2", status: "APPROVED", startDate: d("2026-11-10"), endDate: d("2026-11-20") },
        // APPROVED but not yet started does not count
        { id: "c3", topicId: "t2", status: "APPROVED", startDate: d("2026-12-01"), endDate: d("2026-12-20") },
        { id: "c4", topicId: "t1", status: "PENDING_APPROVAL", startDate: d("2026-12-01"), endDate: d("2026-12-31") },
        { id: "c5", topicId: "t1", status: "ARCHIVED", startDate: d("2026-11-01"), endDate: d("2026-12-31") },
      ],
      plannedPosts: [
        { id: "p1", campaignId: "c1", angle: "A", slotAt: d("2026-11-16T02:00:00Z"), status: "APPROVED", platforms: ["FACEBOOK"] },
        { id: "p2", campaignId: "c1", angle: "B", slotAt: d("2026-11-14T02:00:00Z"), status: "IDEA", platforms: ["FACEBOOK"] }, // past
        { id: "p3", campaignId: "c2", angle: "C", slotAt: d("2026-11-15T05:00:00Z"), status: "IDEA", platforms: ["LINE"] },
        { id: "p4", campaignId: "c1", angle: "D", slotAt: d("2026-11-17T02:00:00Z"), status: "FAILED", platforms: ["INSTAGRAM"] },
        { id: "p5", campaignId: "c5", angle: "E", slotAt: d("2026-11-18T02:00:00Z"), status: "IDEA", platforms: ["FACEBOOK"] }, // archived campaign
        { id: "p6", campaignId: "c1", angle: "F", slotAt: d("2026-11-19T02:00:00Z"), status: "SKIPPED", platforms: ["FACEBOOK"] },
        { id: "p7", campaignId: "c1", angle: "G", slotAt: d("2026-11-20T02:00:00Z"), status: "SCHEDULED", platforms: ["FACEBOOK"] },
        { id: "p8", campaignId: "c1", angle: "H", slotAt: d("2026-11-21T02:00:00Z"), status: "IDEA", platforms: ["FACEBOOK"] },
        { id: "p9", campaignId: "c1", angle: "I", slotAt: d("2026-11-22T02:00:00Z"), status: "IDEA", platforms: ["FACEBOOK"] },
        { id: "p10", campaignId: "c1", angle: "J", slotAt: d("2026-11-23T02:00:00Z"), status: "IDEA", platforms: ["FACEBOOK"] },
      ],
      unassignedPostCount: 4,
    },
    now
  );

  assert.equal(summary.activeTopics, 2);
  assert.equal(summary.runningCampaigns, 2);
  assert.equal(summary.pendingApprovals, 1);
  assert.equal(summary.failedPosts, 1);
  assert.equal(summary.unassignedPosts, 4);

  // Upcoming: future, not FAILED/SKIPPED/PUBLISHED, not from archived campaigns, sorted, max 5
  assert.deepEqual(
    summary.upcoming.map((u) => u.id),
    ["p3", "p1", "p7", "p8", "p9"]
  );
  assert.equal(summary.upcoming[0].topicName, "แบต");
  assert.equal(summary.upcoming[1].topicColor, "#111111");

  // Empty brand
  const empty = buildBrandSummary(
    { topics: [], campaigns: [], plannedPosts: [], unassignedPostCount: 0 },
    now
  );
  assert.equal(empty.activeTopics, 0);
  assert.deepEqual(empty.upcoming, []);

  // Bangkok date helpers
  assert.equal(bangkokDateToIso("2026-11-01"), "2026-10-31T17:00:00.000Z");
  assert.equal(bangkokDateTimeToIso("2026-11-20T09:00"), "2026-11-20T02:00:00.000Z");
  assert.equal(toBangkokDateInput(new Date("2026-10-31T17:00:00Z")), "2026-11-01");
  assert.equal(toBangkokDateTimeInput(new Date("2026-11-20T02:00:00Z")), "2026-11-20T09:00");

  console.log("✓ planner-overview tests passed");
}
