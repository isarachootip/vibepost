"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { topicInputSchema } from "@/lib/validations/planner.schema";
import { createTopic, setTopicStatus, updateTopic } from "@/lib/repositories/planner/topic.repository";
import { requirePlannerRole, PLANNER_PATH } from "./access";
import { errorToResult, fail, ok, zodFail, type ActionResult } from "./action-result";

export async function createTopicAction(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = topicInputSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);
  try {
    await requirePlannerRole(parsed.data.workspaceId, "MEMBER");
    const topic = await createTopic(parsed.data);
    revalidatePath(PLANNER_PATH, "layout");
    return ok(topic);
  } catch (e) {
    return errorToResult(e);
  }
}

export async function updateTopicAction(topicId: string, raw: unknown): Promise<ActionResult> {
  const parsed = topicInputSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);
  try {
    const { workspaceId, ...data } = parsed.data;
    await requirePlannerRole(workspaceId, "MEMBER");
    const updated = await updateTopic(workspaceId, topicId, data);
    if (!updated) return fail("ไม่พบ Topic นี้");
    revalidatePath(PLANNER_PATH, "layout");
    return ok(null);
  } catch (e) {
    return errorToResult(e);
  }
}

const topicStatusSchema = z.object({
  workspaceId: z.string().min(1),
  topicId: z.string().min(1),
  status: z.enum(["ACTIVE", "ARCHIVED"]),
});

/** Archive/restore is ADMIN-only. Topics are never hard-deleted. */
export async function setTopicStatusAction(raw: unknown): Promise<ActionResult> {
  const parsed = topicStatusSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);
  try {
    const { workspaceId, topicId, status } = parsed.data;
    await requirePlannerRole(workspaceId, "ADMIN");
    const updated = await setTopicStatus(workspaceId, topicId, status);
    if (!updated) return fail("ไม่พบ Topic นี้");
    revalidatePath(PLANNER_PATH, "layout");
    return ok(null);
  } catch (e) {
    return errorToResult(e);
  }
}
