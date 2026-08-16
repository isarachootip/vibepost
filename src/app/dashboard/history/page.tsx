import React from "react";
import { getPublishedPostsForLanding, getDraftPostsAction } from "@/lib/actions/posts";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getAIUsageStatsAction } from "@/lib/actions/ai-generation";
import { HistoryTabsClient } from "./HistoryTabsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Content & Auto Post History | Vibe Post",
  description: "ประวัติการโพสต์อัตโนมัติและคลังแบบร่างของระบบ Vibe Post",
};

export default async function AutoPostHistoryPage() {
  const [workspace, { posts, totalPosts, totalChannels }, aiUsageResult, draftsResult] =
    await Promise.all([
      getActiveWorkspaceContext(),
      getPublishedPostsForLanding(),
      getAIUsageStatsAction(),
      getDraftPostsAction(),
    ]);

  const successCount = posts.filter((p) =>
    p.channels.every((c) => c.status === "PUBLISHED")
  ).length;

  const aiStats = aiUsageResult.success ? aiUsageResult.stats : null;
  const drafts = draftsResult.success ? draftsResult.drafts : [];

  const connections =
    workspace?.socialConnections.map((c) => ({
      id: c.id,
      platform: c.platform,
      accountName: c.accountName,
      isActive: c.isActive,
    })) ?? [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #5856d6, #34aadc)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="m9 16 2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Content Hub & Post History
            </h1>
            <p className="text-slate-500 text-xs font-medium">
              คลังแบบร่างรอโพสต์ (Drafts Queue) และประวัติการเผยแพร่อัตโนมัติ
              {workspace ? ` · ${workspace.name}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabbed View: Drafts / Published / AI ── */}
      <HistoryTabsClient
        drafts={drafts}
        connections={connections}
        posts={posts}
        totalPosts={totalPosts}
        totalChannels={totalChannels}
        successCount={successCount}
        aiStats={aiStats}
        workspaceName={workspace?.name}
      />
    </div>
  );
}
