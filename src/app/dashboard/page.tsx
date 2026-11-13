import React from "react";
import Link from "next/link";
import { Layers } from "lucide-react";
import { auth } from "@/auth";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import {
  MobileDashboardOverview,
  type MobileWorkspaceProps,
} from "@/components/dashboard/MobileDashboardOverview";
import { DashboardHeroBanner } from "@/components/dashboard/DashboardHeroBanner";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { DashboardPipelineSection } from "@/components/dashboard/DashboardPipelineSection";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const [session, workspace] = await Promise.all([
    auth(),
    getActiveWorkspaceContext(),
  ]);

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center h-[60vh]">
        <div className="neu-tint-primary size-14 rounded-2xl flex items-center justify-center mb-4">
          <Layers className="size-7" />
        </div>
        <h2 className="font-display text-xl text-foreground mb-2">
          No Workspace Found
        </h2>
        <p className="text-muted-foreground max-w-sm mb-6 text-sm">
          จำเป็นต้องเลือกหรือสร้าง Workspace เพื่อเริ่มต้นใช้งานระบบ Auto-Post
        </p>
        <Link
          href="/dashboard/workspaces"
          className="neu-tint-primary px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-110"
        >
          สร้าง Workspace ใหม่
        </Link>
      </div>
    );
  }

  const mobileWorkspace: MobileWorkspaceProps = {
    id: workspace.id,
    name: workspace.name,
    _count: {
      posts: workspace._count.posts,
      members: workspace._count.members,
    },
    socialConnections: workspace.socialConnections.map((conn) => ({
      id: conn.id,
      platform: conn.platform,
      accountName: conn.accountName,
    })),
    promptConfigs: workspace.promptConfigs.map((cfg) => ({
      id: cfg.id,
      provider: cfg.provider,
    })),
  };

  return (
    <>
      <div className="block md:hidden">
        <MobileDashboardOverview workspace={mobileWorkspace} />
      </div>

      <div className="hidden md:block space-y-6 animate-in fade-in duration-300">
        <DashboardHeroBanner
          workspaceName={workspace.name}
          userName={session?.user?.name}
        />
        <DashboardStatsGrid
          metrics={{
            postsCount: workspace._count.posts,
            connectionsCount: workspace.socialConnections.length,
            membersCount: workspace._count.members,
            promptsCount: workspace.promptConfigs.length,
          }}
        />
        <DashboardPipelineSection
          hasPromptConfigs={workspace.promptConfigs.length > 0}
        />
      </div>
    </>
  );
}
