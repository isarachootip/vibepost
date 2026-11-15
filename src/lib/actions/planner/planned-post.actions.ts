"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assignTopicSchema, plannedPostInputSchema } from "@/lib/validations/planner.schema";
import { findCampaignInWorkspace } from "@/lib/repositories/planner/campaign.repository";
import {
  createPlannedPost,
  findPlannedPostInWorkspace,
  setPlannedPostStatus,
  updatePlannedPost,
} from "@/lib/repositories/planner/planned-post.repository";
import { assignPostTopic } from "@/lib/repositories/planner/overview.repository";
import { isCampaignEditable } from "@/lib/services/planner/campaign-status.service";
import { isPlannedPostLocked, isSlotWithinCampaign } from "@/lib/services/planner/planned-post-rules.service";
import { requirePlannerRole, PLANNER_PATH } from "./access";
import { errorToResult, fail, ok, zodFail, type ActionResult } from "./action-result";

const OUT_OF_WINDOW = "วันโพสต์ต้องอยู่ในช่วงเวลาของ Campaign";
const NOT_EDITABLE = "Campaign อยู่ในสถานะที่แก้ไขแผนไม่ได้";

export async function createPlannedPostAction(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = plannedPostInputSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);
  try {
    await requirePlannerRole(parsed.data.workspaceId, "MEMBER");
    const campaign = await findCampaignInWorkspace(parsed.data.workspaceId, parsed.data.campaignId);
    if (!campaign) return fail("ไม่พบ Campaign นี้");
    if (!isCampaignEditable(campaign.status)) return fail(NOT_EDITABLE);
    if (!isSlotWithinCampaign(parsed.data.slotAt, campaign)) return fail(OUT_OF_WINDOW);
    const created = await createPlannedPost(parsed.data);
    revalidatePath(PLANNER_PATH, "layout");
    return ok(created);
  } catch (e) {
    return errorToResult(e);
  }
}

export async function updatePlannedPostAction(plannedPostId: string, raw: unknown): Promise<ActionResult> {
  const parsed = plannedPostInputSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);
  try {
    await requirePlannerRole(parsed.data.workspaceId, "MEMBER");
    const existing = await findPlannedPostInWorkspace(parsed.data.workspaceId, plannedPostId);
    if (!existing) return fail("ไม่พบแผนโพสต์นี้");
    if (isPlannedPostLocked(existing.status)) return fail("โพสต์ถูกตั้งเวลา/เผยแพร่แล้ว ให้แก้ที่ตัวโพสต์แทน");
    if (!isCampaignEditable(existing.campaign.status)) return fail(NOT_EDITABLE);
    if (!isSlotWithinCampaign(parsed.data.slotAt, existing.campaign)) return fail(OUT_OF_WINDOW);
    await updatePlannedPost(plannedPostId, parsed.data);
    revalidatePath(PLANNER_PATH, "layout");
    return ok(null);
  } catch (e) {
    return errorToResult(e);
  }
}

const skipSchema = z.object({ workspaceId: z.string().min(1), plannedPostId: z.string().min(1) });

/** Planned posts are skipped, not deleted, so history stays intact. */
export async function skipPlannedPostAction(raw: unknown): Promise<ActionResult> {
  const parsed = skipSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);
  try {
    await requirePlannerRole(parsed.data.workspaceId, "MEMBER");
    const existing = await findPlannedPostInWorkspace(parsed.data.workspaceId, parsed.data.plannedPostId);
    if (!existing) return fail("ไม่พบแผนโพสต์นี้");
    if (isPlannedPostLocked(existing.status)) return fail("โพสต์ถูกตั้งเวลา/เผยแพร่แล้ว ข้ามไม่ได้");
    await setPlannedPostStatus(existing.id, "SKIPPED");
    revalidatePath(PLANNER_PATH, "layout");
    return ok(null);
  } catch (e) {
    return errorToResult(e);
  }
}

export async function assignPostTopicAction(raw: unknown): Promise<ActionResult> {
  const parsed = assignTopicSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);
  try {
    const { workspaceId, postId, topicId } = parsed.data;
    await requirePlannerRole(workspaceId, "MEMBER");
    if (!(await assignPostTopic(workspaceId, postId, topicId))) return fail("ไม่พบโพสต์หรือ Topic");
    revalidatePath(PLANNER_PATH, "layout");
    return ok(null);
  } catch (e) {
    return errorToResult(e);
  }
}
