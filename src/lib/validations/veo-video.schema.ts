import { z } from "zod";

export const veoModelTierSchema = z.enum(["FAST", "STANDARD"]);
export type VeoModelTier = z.infer<typeof veoModelTierSchema>;

export const veoAspectRatioSchema = z.enum(["9:16", "16:9"]);
export type VeoAspectRatio = z.infer<typeof veoAspectRatioSchema>;

export const veoDurationSchema = z.union([z.literal(4), z.literal(6), z.literal(8)]);
export type VeoDurationSeconds = z.infer<typeof veoDurationSchema>;

export const startVeoJobSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "กรุณาระบุรายละเอียดฉากวิดีโอ (Prompt)")
    .max(4000, "Prompt ยาวเกินขีดจำกัด"),
  modelTier: veoModelTierSchema.default("FAST"),
  aspectRatio: veoAspectRatioSchema.default("9:16"),
  durationSeconds: veoDurationSchema.default(6),
  sourceImageUrl: z.string().trim().min(1).max(2048).optional(),
});

export type StartVeoJobInput = z.infer<typeof startVeoJobSchema>;

export const updateDailyVideoQuotaSchema = z.object({
  dailyVideoQuota: z.coerce
    .number()
    .int("โควตาต้องเป็นจำนวนเต็ม")
    .min(0, "โควตาต้องไม่ติดลบ")
    .max(100, "กำหนดโควตาได้สูงสุด 100 คลิปต่อวัน"),
});

export type UpdateDailyVideoQuotaInput = z.infer<typeof updateDailyVideoQuotaSchema>;
