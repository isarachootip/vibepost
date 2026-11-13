import { PublishedPostForGallery } from "@/lib/actions/posts";

export interface HistoryConnection {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
}

export interface AIUsageLogItem {
  id: string;
  actionType: string;
  provider: string;
  modelName: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  createdAt: string;
}

export interface AIUsageStats {
  totalCost: number;
  totalTokens: number;
  totalCalls: number;
  articleCalls: number;
  imageCalls: number;
  videoCalls: number;
  logs: AIUsageLogItem[];
}

export const HISTORY_ACTION_CONFIG: Record<
  string,
  { label: string; badgeClass: string; emoji: string }
> = {
  ARTICLE: {
    label: "เขียนบทความ",
    badgeClass: "bg-violet-500/12 text-violet-600 dark:text-violet-300 border-violet-500/25",
    emoji: "✍️",
  },
  IMAGE: {
    label: "สร้างรูปภาพ",
    badgeClass: "bg-pink-500/12 text-pink-600 dark:text-pink-300 border-pink-500/25",
    emoji: "🎨",
  },
  VIDEO: {
    label: "สร้างวิดีโอ",
    badgeClass: "bg-sky-500/12 text-sky-600 dark:text-sky-300 border-sky-500/25",
    emoji: "🎬",
  },
};

export function formatHistoryDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(date));
}

export type HistoryPostItem = PublishedPostForGallery;
