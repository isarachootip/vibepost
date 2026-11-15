import assert from "node:assert/strict";
import {
  canTransitionCampaign,
  isCampaignEditable,
  hasWorkspaceRole,
} from "../src/lib/services/planner/campaign-status.service";
import {
  isPlannedPostLocked,
  isSlotWithinCampaign,
} from "../src/lib/services/planner/planned-post-rules.service";

export async function runCampaignStatusTests(): Promise<void> {
  // Role ranking
  assert.ok(hasWorkspaceRole("ADMIN", "MEMBER"));
  assert.ok(hasWorkspaceRole("MEMBER", "MEMBER"));
  assert.equal(hasWorkspaceRole("VIEWER", "MEMBER"), false);

  // MEMBER submits for approval; VIEWER cannot
  assert.ok(canTransitionCampaign("DRAFT", "PENDING_APPROVAL", "MEMBER"));
  assert.equal(canTransitionCampaign("DRAFT", "PENDING_APPROVAL", "VIEWER"), false);

  // Only ADMIN approves
  assert.ok(canTransitionCampaign("PENDING_APPROVAL", "APPROVED", "ADMIN"));
  assert.equal(canTransitionCampaign("PENDING_APPROVAL", "APPROVED", "MEMBER"), false);

  // MEMBER can withdraw back to draft; ADMIN can reject back to draft
  assert.ok(canTransitionCampaign("PENDING_APPROVAL", "DRAFT", "MEMBER"));
  assert.ok(canTransitionCampaign("PENDING_APPROVAL", "DRAFT", "ADMIN"));

  // Lifecycle forward
  assert.ok(canTransitionCampaign("APPROVED", "ACTIVE", "ADMIN"));
  assert.ok(canTransitionCampaign("ACTIVE", "COMPLETED", "ADMIN"));

  // Illegal jumps
  assert.equal(canTransitionCampaign("DRAFT", "APPROVED", "ADMIN"), false);
  assert.equal(canTransitionCampaign("DRAFT", "ACTIVE", "ADMIN"), false);
  assert.equal(canTransitionCampaign("COMPLETED", "ACTIVE", "ADMIN"), false);
  assert.equal(canTransitionCampaign("DRAFT", "DRAFT", "ADMIN"), false);

  // Archive from any non-archived status, ADMIN only; restore to DRAFT
  assert.ok(canTransitionCampaign("ACTIVE", "ARCHIVED", "ADMIN"));
  assert.ok(canTransitionCampaign("DRAFT", "ARCHIVED", "ADMIN"));
  assert.equal(canTransitionCampaign("DRAFT", "ARCHIVED", "MEMBER"), false);
  assert.ok(canTransitionCampaign("ARCHIVED", "DRAFT", "ADMIN"));

  // Editability
  assert.ok(isCampaignEditable("DRAFT"));
  assert.ok(isCampaignEditable("ACTIVE"));
  assert.equal(isCampaignEditable("PENDING_APPROVAL"), false);
  assert.equal(isCampaignEditable("COMPLETED"), false);
  assert.equal(isCampaignEditable("ARCHIVED"), false);

  // Planned post locks once scheduled/published
  assert.ok(isPlannedPostLocked("SCHEDULED"));
  assert.ok(isPlannedPostLocked("PUBLISHED"));
  assert.equal(isPlannedPostLocked("IDEA"), false);
  assert.equal(isPlannedPostLocked("FAILED"), false);

  // Slot must fall inside campaign window (end date inclusive for the whole day)
  const campaign = {
    startDate: new Date("2026-11-01T00:00:00Z"),
    endDate: new Date("2026-11-30T00:00:00Z"),
  };
  assert.ok(isSlotWithinCampaign(new Date("2026-11-01T00:00:00Z"), campaign));
  assert.ok(isSlotWithinCampaign(new Date("2026-11-30T23:30:00Z"), campaign));
  assert.equal(isSlotWithinCampaign(new Date("2026-10-31T23:59:00Z"), campaign), false);
  assert.equal(isSlotWithinCampaign(new Date("2026-12-01T00:00:00Z"), campaign), false);

  console.log("✓ campaign-status tests passed");
}
