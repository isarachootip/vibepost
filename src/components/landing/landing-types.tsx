import React from "react";

export { LANDING_COPY, getDemoPosts } from "./landing-copy";

export type LandingLang = "th" | "en" | "cn";

export interface LandingMediaItem {
  url: string;
  fileName: string;
  type?: string;
}

export interface LandingChannelItem {
  platform: string;
  accountName: string;
  status?: string;
  externalPostId?: string | null;
}

export interface LandingPost {
  id: string;
  content: string;
  publishedTime: Date | string | null;
  workspace?: string;
  workspaceShowOnLanding?: boolean;
  showOnLanding?: boolean;
  isPinnedOnLanding?: boolean;
  effectivelyVisible?: boolean;
  images: LandingMediaItem[];
  channels: LandingChannelItem[];
}

export interface PlatformStyle {
  label: string;
  bg: string;
  icon: React.ReactNode;
}

export interface LandingCopy {
  badge: string;
  heroTitleLine1: string;
  heroTitleAccent: string;
  desc: string;
  ctaStudio: string;
  ctaGallery: string;
  demoTag: string;
  totalPosts: string;
  platforms: string;
  success: string;
  channels: string;
  latest: string;
  login: string;
  items: string;
  footerPrefix: string;
  footerLink: string;
  footerSuffix: string;
}

export const PLATFORM_CONFIG: Record<string, PlatformStyle> = {
  FACEBOOK: {
    label: "Facebook",
    bg: "#1877F2",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  INSTAGRAM: {
    label: "Instagram",
    bg: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  TWITTER: {
    label: "X / Twitter",
    bg: "#18181b",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  LINKEDIN: {
    label: "LinkedIn",
    bg: "#0A66C2",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  LINE: {
    label: "LINE",
    bg: "#00C300",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 10.3c0-4.4-4.5-8-10.1-8C8.3 2.3 3.8 5.9 3.8 10.3c0 3.9 3.2 7.2 7.7 7.9-.3 1.1-.9 2.7-.9 2.8-.1.3.1.5.3.6.1 0 .2.1.3.1.2 0 .4-.1.6-.2 1.2-.8 6.4-3.8 8.4-6 1.7-1.3 2.8-3.1 2.8-5.2z" />
      </svg>
    ),
  },
  TIKTOK: {
    label: "TikTok",
    bg: "#111827",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.5 0v16.1c0 2.2-1.8 3.9-3.9 3.9s-3.9-1.8-3.9-3.9 1.8-3.9 3.9-3.9v-3c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7V4.3c2.4 1.8 5.5 2 6.4 2v-3c-1.5 0-4.3-.4-6.5-2.3z" />
      </svg>
    ),
  },
};

export function formatLandingDate(
  date: Date | string | null,
  lang: LandingLang
): string {
  if (!date) return "—";
  const locale = lang === "th" ? "th-TH" : lang === "cn" ? "zh-CN" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getExternalPostUrl(
  platform: string,
  externalId: string | null | undefined
): string | null {
  if (!externalId) return null;
  if (platform === "FACEBOOK") {
    if (externalId.includes("_")) {
      const [pageId, postId] = externalId.split("_");
      return `https://facebook.com/${pageId}/posts/${postId}`;
    }
    return `https://facebook.com/${externalId}`;
  }
  return null;
}
