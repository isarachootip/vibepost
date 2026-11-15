"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { campaignInputSchema } from "@/lib/validations/planner.schema";
import { topicBelongsToWorkspace } from "@/lib/repositories/planner/topic.repository";
import {
  createCampaign,
  findCampaignInWorkspace,
  setCampaignStatus,
  updateCampaign,
} from "@/lib/repositories/planner/campaign.repository";
import { canTransitionCampaign, isCampaignEditable } from "@/lib/services/planner/campaign-status.service";
import { getPlannerAccess, requirePlannerRole, PLANNER_PATH } from "./access";
import { errorToResult, fail, ok, zodFail, type ActionResult } from "./action-result";

export async function createCampaignAction(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = campaignInputSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);
  try {
    await requirePlannerRole(parsed.data.workspaceId, "MEMBER");
    if (!(await topicBelongsToWorkspace(parsed.data.workspaceId, parsed.data.topicId))) {
      return fail("ไม่พบ Topic นี้");
    }
    const campaign = await createCampaign(parsed.data);
    revalidatePath(PLANNER_PATH, "layout");
    return ok(campaign);
  } catch (e) {
    return errorToResult(e);
  }
}

export async function updateCampaignAction(campaignId: string, raw: unknown): Promise<ActionResult> {
  const parsed = campaignInputSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);
  try {
    await requirePlannerRole(parsed.data.workspaceId, "MEMBER");
    const existing = await findCampaignInWorkspace(parsed.data.workspaceId, campaignId);
    if (!existing) return fail("ไม่พบ Campaign นี้");
    if (!isCampaignEditable(existing.status)) {
      return fail("Campaign อยู่ในสถานะที่แก้ไขไม่ได้ (รออนุมัติ / จบแล้ว / Archive)");
    }
    await updateCampaign(campaignId, parsed.data);
    revalidatePath(PLANNER_PATH, "layout");
    return ok(null);
  } catch (e) {
    return errorToResult(e);
  }
}

const transitionSchema = z.object({
  workspaceId: z.string().min(1),
  campaignId: z.string().min(1),
  to: z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "ACTIVE", "COMPLETED", "ARCHIVED"]),
});

export async function transitionCampaignAction(raw: unknown): Promise<ActionResult> {
  const parsed = transitionSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);
  try {
    const { workspaceId, campaignId, to } = parsed.data;
    const { user, role } = await getPlannerAccess(workspaceId);
    const existing = await findCampaignInWorkspace(workspaceId, campaignId);
    if (!existing) return fail("ไม่พบ Campaign นี้");
    if (!canTransitionCampaign(existing.status, to, role)) {
      return fail("ไม่สามารถเปลี่ยนสถานะนี้ได้ หรือคุณไม่มีสิทธิ์");
    }
    await setCampaignStatus(campaignId, to, to === "APPROVED" ? user.id : null);
    revalidatePath(PLANNER_PATH, "layout");
    return ok(null);
  } catch (e) {
    return errorToResult(e);
  }
}
