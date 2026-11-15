import type { CampaignGoalValue, PlannedFormatValue, PlatformValue } from "@/lib/validations/planner.schema";
import type { CampaignStatusValue } from "@/lib/services/planner/campaign-status.service";
import type { PlannedPostStatusValue } from "@/lib/services/planner/planned-post-rules.service";

export interface GoalInfo {
  emoji: string;
  label: string;
  metric: string;
  unit: string;
  explain: string;
}

/** Plain-language goals: users pick what they want, the metric is derived for them. */
export const GOAL_INFO: Record<CampaignGoalValue, GoalInfo> = {
  AWARENESS: {
    emoji: "👀",
    label: "อยากให้คนเห็นเยอะ",
    metric: "Reach",
    unit: "คน",
    explain: "จำนวนคนที่เห็นโพสต์ (คนเดียวเห็นหลายรอบนับครั้งเดียว)",
  },
  ENGAGEMENT: {
    emoji: "💬",
    label: "อยากให้คนไลก์ คอมเมนต์ แชร์",
    metric: "Engagement Rate",
    unit: "%",
    explain: "จากคนที่เห็น 100 คน มีกี่คนที่กดไลก์ คอมเมนต์ หรือแชร์",
  },
  TRAFFIC: {
    emoji: "🔗",
    label: "อยากให้คนคลิกไปเว็บหรือ LINE",
    metric: "CTR",
    unit: "%",
    explain: "จากคนที่เห็น 100 คน มีกี่คนที่คลิกลิงก์ (มีข้อมูลเฉพาะ Facebook)",
  },
};

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatusValue, string> = {
  DRAFT: "ร่าง",
  PENDING_APPROVAL: "รออนุมัติ",
  APPROVED: "อนุมัติแล้ว",
  ACTIVE: "กำลังรัน",
  COMPLETED: "จบแล้ว",
  ARCHIVED: "Archive",
};

/** Button text for moving a campaign to a status. */
export const CAMPAIGN_TRANSITION_LABEL: Record<CampaignStatusValue, string> = {
  DRAFT: "กลับเป็นร่าง",
  PENDING_APPROVAL: "ส่งขออนุมัติ",
  APPROVED: "อนุมัติ",
  ACTIVE: "เริ่มรัน",
  COMPLETED: "ปิด Campaign",
  ARCHIVED: "Archive",
};

export const PLANNED_STATUS_LABEL: Record<PlannedPostStatusValue, string> = {
  IDEA: "ไอเดีย",
  APPROVED: "อนุมัติแล้ว",
  GENERATED: "สร้างคอนเทนต์แล้ว",
  SCHEDULED: "ตั้งเวลาแล้ว",
  PUBLISHED: "โพสต์แล้ว",
  FAILED: "ล้มเหลว",
  SKIPPED: "ข้าม",
};

export const FORMAT_LABEL: Record<PlannedFormatValue, string> = {
  TEXT: "ข้อความ",
  IMAGE: "รูปเดี่ยว",
  CAROUSEL: "หลายรูป",
  VIDEO: "วิดีโอ",
};

export const PLATFORM_LABEL: Record<PlatformValue, string> = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  TWITTER: "X",
  LINKEDIN: "LinkedIn",
  LINE: "LINE",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
};

export type Tone = "neutral" | "info" | "warn" | "success" | "danger";

export const CAMPAIGN_STATUS_TONE: Record<CampaignStatusValue, Tone> = {
  DRAFT: "neutral",
  PENDING_APPROVAL: "warn",
  APPROVED: "info",
  ACTIVE: "success",
  COMPLETED: "neutral",
  ARCHIVED: "neutral",
};

export const PLANNED_STATUS_TONE: Record<PlannedPostStatusValue, Tone> = {
  IDEA: "neutral",
  APPROVED: "info",
  GENERATED: "info",
  SCHEDULED: "warn",
  PUBLISHED: "success",
  FAILED: "danger",
  SKIPPED: "neutral",
};
