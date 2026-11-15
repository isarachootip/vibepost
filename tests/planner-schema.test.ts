import assert from "node:assert/strict";
import {
  topicInputSchema,
  campaignInputSchema,
  plannedPostInputSchema,
  assignTopicSchema,
} from "../src/lib/validations/planner.schema";

export async function runPlannerSchemaTests(): Promise<void> {
  // Topic: valid input with trimmed, de-duplicated keywords
  {
    const r = topicInputSchema.safeParse({
      workspaceId: "ws1",
      name: "  ยาง  ",
      keywords: ["ยางรถยนต์", "ยางรถยนต์", " หน้าฝน "],
    });
    assert.ok(r.success);
    if (r.success) {
      assert.equal(r.data.name, "ยาง");
      assert.deepEqual(r.data.keywords, ["ยางรถยนต์", "หน้าฝน"]);
      assert.equal(r.data.color, "#6366f1");
    }
  }

  // Topic: empty name rejected, bad color rejected
  assert.equal(topicInputSchema.safeParse({ workspaceId: "ws1", name: "  " }).success, false);
  assert.equal(
    topicInputSchema.safeParse({ workspaceId: "ws1", name: "แบต", color: "red" }).success,
    false
  );

  // Campaign: valid
  const baseCampaign = {
    workspaceId: "ws1",
    topicId: "t1",
    name: "ยางหน้าฝน",
    startDate: "2026-11-01",
    endDate: "2026-12-31",
    goal: "ENGAGEMENT",
  };
  {
    const r = campaignInputSchema.safeParse({ ...baseCampaign, kpiTarget: 3, budget: 5000 });
    assert.ok(r.success);
    if (r.success) {
      assert.ok(r.data.startDate instanceof Date);
      assert.equal(r.data.currency, "THB");
    }
  }

  // Campaign: end before start rejected
  assert.equal(
    campaignInputSchema.safeParse({ ...baseCampaign, startDate: "2026-12-31", endDate: "2026-11-01" })
      .success,
    false
  );
  // Campaign: negative budget / non-positive KPI / unknown goal rejected
  assert.equal(campaignInputSchema.safeParse({ ...baseCampaign, budget: -1 }).success, false);
  assert.equal(campaignInputSchema.safeParse({ ...baseCampaign, kpiTarget: 0 }).success, false);
  assert.equal(campaignInputSchema.safeParse({ ...baseCampaign, goal: "SALES" }).success, false);

  // PlannedPost: valid, platforms de-duplicated
  {
    const r = plannedPostInputSchema.safeParse({
      workspaceId: "ws1",
      campaignId: "c1",
      slotAt: "2026-11-20T09:00:00+07:00",
      angle: "5 สัญญาณว่ายางต้องเปลี่ยน",
      format: "CAROUSEL",
      platforms: ["FACEBOOK", "INSTAGRAM", "FACEBOOK"],
    });
    assert.ok(r.success);
    if (r.success) assert.deepEqual(r.data.platforms, ["FACEBOOK", "INSTAGRAM"]);
  }

  // PlannedPost: no platforms / unknown platform / empty angle rejected
  const basePlanned = { workspaceId: "ws1", campaignId: "c1", slotAt: "2026-11-20", angle: "x" };
  assert.equal(plannedPostInputSchema.safeParse({ ...basePlanned, platforms: [] }).success, false);
  assert.equal(
    plannedPostInputSchema.safeParse({ ...basePlanned, platforms: ["MYSPACE"] }).success,
    false
  );
  assert.equal(
    plannedPostInputSchema.safeParse({ ...basePlanned, angle: " ", platforms: ["LINE"] }).success,
    false
  );

  // Assign topic: null topic = Unassigned allowed
  assert.ok(assignTopicSchema.safeParse({ workspaceId: "ws1", postId: "p1", topicId: null }).success);
  assert.equal(assignTopicSchema.safeParse({ workspaceId: "ws1", postId: "" }).success, false);

  console.log("✓ planner-schema tests passed");
}
