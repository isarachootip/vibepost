import { z } from "zod";

// Mirrors Prisma enums; kept here so UI + validation share one source without importing Prisma.
export const PLATFORMS = ["FACEBOOK", "INSTAGRAM", "TWITTER", "LINKEDIN", "LINE", "TIKTOK", "YOUTUBE"] as const;
export const CAMPAIGN_GOALS = ["AWARENESS", "ENGAGEMENT", "TRAFFIC"] as const;
export const PLANNED_FORMATS = ["TEXT", "IMAGE", "CAROUSEL", "VIDEO"] as const;

export type PlatformValue = (typeof PLATFORMS)[number];
export type CampaignGoalValue = (typeof CAMPAIGN_GOALS)[number];
export type PlannedFormatValue = (typeof PLANNED_FORMATS)[number];

const id = z.string().trim().min(1, "ไม่พบรหัสอ้างอิง");
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const uniqueTrimmed = (items: string[]): string[] =>
  Array.from(new Set(items.map((s) => s.trim()).filter((s) => s.length > 0)));

export const topicInputSchema = z.object({
  workspaceId: id,
  name: z.string().trim().min(1, "กรุณาใส่ชื่อ Topic").max(80),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "สีต้องอยู่ในรูปแบบ #RRGGBB")
    .default("#6366f1"),
  audience: optionalText(500),
  sellingPoints: optionalText(1000),
  keywords: z.array(z.string().max(50)).max(30).default([]).transform(uniqueTrimmed),
  forbidden: optionalText(500),
  tone: optionalText(200),
});
export type TopicInput = z.infer<typeof topicInputSchema>;

export const campaignInputSchema = z
  .object({
    workspaceId: id,
    topicId: id,
    name: z.string().trim().min(1, "กรุณาใส่ชื่อ Campaign").max(120),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    goal: z.enum(CAMPAIGN_GOALS),
    kpiTarget: z.number().positive("เป้า KPI ต้องมากกว่า 0").optional(),
    budget: z.number().min(0, "งบประมาณต้องไม่ติดลบ").optional(),
    currency: z.string().trim().length(3).default("THB"),
  })
  .refine((c) => c.endDate.getTime() >= c.startDate.getTime(), {
    message: "วันสิ้นสุดต้องไม่ก่อนวันเริ่ม",
    path: ["endDate"],
  });
export type CampaignInput = z.infer<typeof campaignInputSchema>;

export const plannedPostInputSchema = z.object({
  workspaceId: id,
  campaignId: id,
  slotAt: z.coerce.date(),
  angle: z.string().trim().min(1, "กรุณาใส่มุมเล่าเรื่อง (angle)").max(300),
  format: z.enum(PLANNED_FORMATS).default("IMAGE"),
  platforms: z
    .array(z.enum(PLATFORMS))
    .min(1, "เลือกช่องทางอย่างน้อย 1 ช่องทาง")
    .transform((list) => Array.from(new Set(list))),
  notes: optionalText(1000),
});
export type PlannedPostInput = z.infer<typeof plannedPostInputSchema>;

export const assignTopicSchema = z.object({
  workspaceId: id,
  postId: id,
  topicId: id.nullable(),
});
export type AssignTopicInput = z.infer<typeof assignTopicSchema>;
