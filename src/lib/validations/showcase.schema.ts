import { z } from "zod";

export const togglePostShowcaseSchema = z.object({
  postId: z.string().trim().min(1, "ไม่พบรหัสโพสต์"),
  showOnLanding: z.boolean(),
});

export type TogglePostShowcaseInput = z.infer<typeof togglePostShowcaseSchema>;

export const togglePostPinSchema = z.object({
  postId: z.string().trim().min(1, "ไม่พบรหัสโพสต์"),
  isPinnedOnLanding: z.boolean(),
});

export type TogglePostPinInput = z.infer<typeof togglePostPinSchema>;

export const updateWorkspaceShowcaseSchema = z.object({
  workspaceId: z.string().trim().min(1, "ไม่พบรหัส Workspace"),
  showOnLanding: z.boolean(),
});

export type UpdateWorkspaceShowcaseInput = z.infer<typeof updateWorkspaceShowcaseSchema>;
