import { z } from "zod";

export const publishModeSchema = z.enum(["NOW", "SCHEDULE"]);
export type PublishMode = z.infer<typeof publishModeSchema>;

export const minuteSlotSchema = z.enum(["00", "15", "30", "45"]);
export type MinuteSlot = z.infer<typeof minuteSlotSchema>;

export const createScheduledPostInputSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "เนื้อหาโพสต์ต้องไม่ว่างเปล่า"),
  scheduledTime: z.date().nullable(),
  targetConnectionIds: z
    .array(z.string().trim().min(1))
    .min(1, "กรุณาเลือกช่องทางโซเชียลมีเดียอย่างน้อย 1 ช่องทาง"),
  imageUrls: z.array(z.string().trim().min(1)).optional(),
  imageUrl: z.string().trim().min(1).optional(),
  publishMode: publishModeSchema.optional(),
});

export type CreateScheduledPostInput = z.infer<typeof createScheduledPostInputSchema>;

export const publishDraftPostInputSchema = z.object({
  postId: z.string().trim().min(1, "ไม่พบรหัสโพสต์แบบร่าง"),
  content: z
    .string()
    .trim()
    .min(1, "เนื้อหาโพสต์ต้องไม่ว่างเปล่า"),
  targetConnectionIds: z
    .array(z.string().trim().min(1))
    .min(1, "กรุณาเลือกช่องทางโซเชียลมีเดียอย่างน้อย 1 ช่องทาง"),
  scheduledTime: z.date().nullable(),
  publishMode: publishModeSchema.optional(),
});

export type PublishDraftPostInput = z.infer<typeof publishDraftPostInputSchema>;
