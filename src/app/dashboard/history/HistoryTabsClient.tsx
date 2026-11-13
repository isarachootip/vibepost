"use client";

import React, { useState } from "react";
import { DraftPostItem } from "@/lib/actions/posts";
import { DraftsManagerSection } from "./DraftsManagerSection";
import { HistoryPublishedTab } from "./HistoryPublishedTab";
import { HistoryAIStatsTab } from "./HistoryAIStatsTab";
import { AIUsageStats, HistoryConnection, HistoryPostItem } from "./history-types";
import { CheckCircle2, Cpu, Layers } from "lucide-react";

type Props = {
  drafts: DraftPostItem[];
  connections: HistoryConnection[];
  posts: HistoryPostItem[];
  totalPosts: number;
  totalChannels: number;
  successCount: number;
  aiStats?: AIUsageStats | null;
  workspaceName?: string;
};

export function HistoryTabsClient({
  drafts,
  connections,
  posts,
  totalPosts,
  totalChannels,
  successCount,
  aiStats,
  workspaceName,
}: Props) {
  const [activeTab, setActiveTab] = useState<"drafts" | "published" | "ai">(
    drafts.length > 0 ? "drafts" : "published"
  );

  const tabClass = (isActive: boolean) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
      isActive
        ? "bg-[var(--surface-elevated)] text-foreground shadow-sm border border-border/70"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="space-y-8">
      {/* Tab Navigation Pill Header */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 neu-pressed rounded-2xl w-fit">
        <button type="button" onClick={() => setActiveTab("drafts")} className={tabClass(activeTab === "drafts")}>
          <Layers className="w-4 h-4 text-primary" />
          <span>คลังแบบร่างรอโพสต์ (Drafts Queue)</span>
          {drafts.length > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              {drafts.length}
            </span>
          )}
        </button>

        <button type="button" onClick={() => setActiveTab("published")} className={tabClass(activeTab === "published")}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>ประวัติโพสต์สำเร็จ (Published History)</span>
          <span className="text-[10px] text-muted-foreground font-bold">({totalPosts})</span>
        </button>

        <button type="button" onClick={() => setActiveTab("ai")} className={tabClass(activeTab === "ai")}>
          <Cpu className="w-4 h-4 text-teal-500" />
          <span>ประวัติการใช้ AI &amp; Token</span>
        </button>
      </div>

      {activeTab === "drafts" && (
        <div className="animate-in fade-in duration-300">
          <DraftsManagerSection initialDrafts={drafts} connections={connections} />
        </div>
      )}

      {activeTab === "published" && (
        <HistoryPublishedTab
          posts={posts}
          totalPosts={totalPosts}
          totalChannels={totalChannels}
          successCount={successCount}
        />
      )}

      {activeTab === "ai" && (
        <HistoryAIStatsTab aiStats={aiStats} workspaceName={workspaceName} />
      )}
    </div>
  );
}
