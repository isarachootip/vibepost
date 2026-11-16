import { z } from "zod";

export const automationActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("trigger"),
  }),
  z.object({
    action: z.literal("disable"),
  }),
  z.object({
    action: z.literal("update"),
    intervalMinutes: z.coerce
      .number()
      .int("intervalMinutes ต้องเป็นจำนวนเต็ม")
      .min(1, "ขั้นต่ำ 1 นาที")
      .max(60, "สูงสุด 60 นาที"),
  }),
]);

export type AutomationActionInput = z.infer<typeof automationActionSchema>;
