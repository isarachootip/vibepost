import { MonitorPost } from "@/lib/actions/monitor";

export const MONITOR_PLATFORMS: Record<
  string,
  { label: string; icon: string; badgeClass: string }
> = {
  FACEBOOK: {
    label: "Facebook",
    icon: "📸",
    badgeClass: "bg-blue-500/12 text-blue-600 dark:text-blue-300 border-blue-500/25",
  },
  INSTAGRAM: {
    label: "Instagram",
    icon: "🖼️",
    badgeClass: "bg-pink-500/12 text-pink-600 dark:text-pink-300 border-pink-500/25",
  },
  TWITTER: {
    label: "Twitter",
    icon: "🐦",
    badgeClass: "bg-[var(--surface-recessed)] text-foreground border-border/70",
  },
  LINKEDIN: {
    label: "LinkedIn",
    icon: "💼",
    badgeClass: "bg-sky-500/12 text-sky-600 dark:text-sky-300 border-sky-500/25",
  },
  LINE: {
    label: "LINE",
    icon: "💬",
    badgeClass: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border-emerald-500/25",
  },
  TIKTOK: {
    label: "TikTok",
    icon: "🎬",
    badgeClass: "bg-[var(--surface-recessed)] text-foreground border-border/70",
  },
};

export const MONITOR_STATUS_MAP: Record<
  string,
  { label: string; bg: string; dot: string }
> = {
  PUBLISHED: {
    label: "สำเร็จ",
    bg: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    dot: "bg-emerald-500",
  },
  FAILED: {
    label: "ล้มเหลว",
    bg: "bg-destructive/12 text-destructive border-destructive/25",
    dot: "bg-destructive",
  },
  SCHEDULED: {
    label: "มีกำหนดการ",
    bg: "bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/25",
    dot: "bg-sky-500",
  },
  PUBLISHING: {
    label: "กำลังโพสต์",
    bg: "bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/25",
    dot: "bg-amber-500",
  },
  DRAFT: {
    label: "ร่าง",
    bg: "bg-[var(--surface-recessed)] text-muted-foreground border-border/70",
    dot: "bg-muted-foreground",
  },
};

export type MonitorViewMode = "month" | "week" | "day";

export interface MonitorColumn {
  label: string;
  subLabel: string;
  date: Date;
}

export function formatMonitorDate(date: Date | null | string): string {
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

export function getMonitorDateRange(date: Date, mode: MonitorViewMode) {
  const start = new Date(date);
  const end = new Date(date);

  if (mode === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
  } else if (mode === "week") {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }
  return { start, end };
}

export function buildMonitorColumns(
  startDate: Date,
  endDate: Date,
  viewMode: MonitorViewMode
): MonitorColumn[] {
  const columns: MonitorColumn[] = [];
  if (viewMode === "month") {
    const daysInMonth = endDate.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const temp = new Date(startDate);
      temp.setDate(i);
      columns.push({
        label: i.toString(),
        subLabel: temp.toLocaleDateString("th-TH", { weekday: "short" }),
        date: new Date(temp),
      });
    }
  } else if (viewMode === "week") {
    const temp = new Date(startDate);
    const dayNames = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];
    for (let i = 0; i < 7; i++) {
      columns.push({
        label: dayNames[i],
        subLabel: `${temp.getDate()} ${temp.toLocaleDateString("th-TH", { month: "short" })}`,
        date: new Date(temp),
      });
      temp.setDate(temp.getDate() + 1);
    }
  } else {
    for (let h = 0; h < 24; h += 2) {
      columns.push({
        label: `${h.toString().padStart(2, "0")}:00`,
        subLabel: "",
        date: new Date(new Date(startDate).setHours(h, 0, 0, 0)),
      });
    }
  }
  return columns;
}

export function getPostsForMonitorSlot(
  posts: MonitorPost[],
  channelId: string,
  colDate: Date,
  viewMode: MonitorViewMode
): MonitorPost[] {
  return posts.filter((post) => {
    const targetsChannel = post.targetConnections.some(
      (t) => t.socialConnectionId === channelId
    );
    if (!targetsChannel) return false;

    const rawTime = post.scheduledTime ?? post.publishedTime;
    if (!rawTime) return false;
    const pDate = new Date(rawTime);

    if (viewMode === "month" || viewMode === "week") {
      return (
        pDate.getDate() === colDate.getDate() &&
        pDate.getMonth() === colDate.getMonth() &&
        pDate.getFullYear() === colDate.getFullYear()
      );
    }
    const postHour = pDate.getHours();
    const colHour = colDate.getHours();
    return postHour >= colHour && postHour < colHour + 2;
  });
}
