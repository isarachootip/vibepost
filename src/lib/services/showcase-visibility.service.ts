export type ShowcaseRole = "ADMIN" | "MEMBER" | "VIEWER" | null;

export interface AuthorizationOutcome {
  allowed: boolean;
  error?: string;
}

export interface RawShowcasePost {
  id: string;
  workspaceId: string;
  workspaceName: string;
  workspaceShowOnLanding: boolean;
  content: string;
  publishedTime: Date | null;
  showOnLanding: boolean;
  isPinnedOnLanding: boolean;
  images: Array<{ url: string; fileName: string; type?: string }>;
  channels: Array<{
    platform: string;
    accountName: string;
    status: string;
    externalPostId?: string | null;
  }>;
}

export interface CuratedShowcasePost extends RawShowcasePost {
  effectivelyVisible: boolean;
}

export interface ShowcaseHeroStats {
  totalPosts: number;
  totalChannels: number;
  totalSuccessfulReposts: number;
  uniquePlatforms: string[];
}

export function authorizePostShowcaseChange(params: {
  isSuperAdmin: boolean;
  workspaceRole: ShowcaseRole;
  workspaceShowOnLanding: boolean;
  nextShowOnLanding: boolean;
}): AuthorizationOutcome {
  if (params.isSuperAdmin) {
    return { allowed: true };
  }

  if (params.workspaceRole !== "ADMIN") {
    return {
      allowed: false,
      error: "สิทธิ์ไม่เพียงพอ — เฉพาะ Admin เท่านั้นที่ปรับการแสดงผลบนหน้าแรกได้",
    };
  }

  // Workspace Admin can always hide; can only unhide if workspace itself is enabled
  if (params.nextShowOnLanding && !params.workspaceShowOnLanding) {
    return {
      allowed: false,
      error:
        "แบรนด์นี้ถูกปิดการแสดงผลบนหน้าแรกไว้โดยผู้ดูแลระบบ ไม่สามารถสั่งแสดงรายโพสต์ได้",
    };
  }

  return { allowed: true };
}

export function authorizePostPinChange(params: {
  isSuperAdmin: boolean;
}): AuthorizationOutcome {
  if (params.isSuperAdmin) {
    return { allowed: true };
  }
  return {
    allowed: false,
    error: "เฉพาะ Super Admin เท่านั้นที่ปักหมุดคอนเทนต์บนหน้าแรกได้",
  };
}

export function authorizeWorkspaceShowcaseChange(params: {
  isSuperAdmin: boolean;
  workspaceRole: ShowcaseRole;
  nextShowOnLanding: boolean;
}): AuthorizationOutcome {
  if (params.isSuperAdmin) {
    return { allowed: true };
  }
  if (params.workspaceRole === "ADMIN" && !params.nextShowOnLanding) {
    return { allowed: true };
  }
  return {
    allowed: false,
    error: params.nextShowOnLanding
      ? "เฉพาะ Super Admin เท่านั้นที่เปิดแบรนด์ขึ้นแสดงบนหน้าแรกสาธารณะได้"
      : "สิทธิ์ไม่เพียงพอ",
  };
}

export function curateShowcaseFeed(
  allPublishedPosts: RawShowcasePost[],
  options: { includeHidden?: boolean; allowlistWorkspaceIds?: string[] } = {}
): {
  posts: CuratedShowcasePost[];
  hiddenCount: number;
  heroStats: ShowcaseHeroStats;
} {
  const allowSet =
    options.allowlistWorkspaceIds && options.allowlistWorkspaceIds.length > 0
      ? new Set(options.allowlistWorkspaceIds)
      : null;

  // Platform-wide Hero metrics preserve real total activity across all published posts
  const platformSet = new Set<string>();
  let totalSuccessfulReposts = 0;

  for (const post of allPublishedPosts) {
    for (const ch of post.channels) {
      platformSet.add(ch.platform);
      if (ch.status === "PUBLISHED") {
        totalSuccessfulReposts++;
      }
    }
  }

  const annotated: CuratedShowcasePost[] = allPublishedPosts.map((p) => {
    const allowedByEnv = allowSet ? allowSet.has(p.workspaceId) : true;
    const effectivelyVisible =
      allowedByEnv && p.workspaceShowOnLanding && p.showOnLanding;
    return { ...p, effectivelyVisible };
  });

  // Sort: Pinned visible posts first, then newest publishedTime descending
  annotated.sort((a, b) => {
    if (a.isPinnedOnLanding !== b.isPinnedOnLanding) {
      return a.isPinnedOnLanding ? -1 : 1;
    }
    const tA = a.publishedTime ? new Date(a.publishedTime).getTime() : 0;
    const tB = b.publishedTime ? new Date(b.publishedTime).getTime() : 0;
    return tB - tA;
  });

  const hiddenCount = annotated.filter((p) => !p.effectivelyVisible).length;
  const posts = options.includeHidden
    ? annotated
    : annotated.filter((p) => p.effectivelyVisible);

  return {
    posts,
    hiddenCount,
    heroStats: {
      totalPosts: allPublishedPosts.length,
      totalChannels: platformSet.size,
      totalSuccessfulReposts,
      uniquePlatforms: Array.from(platformSet),
    },
  };
}
