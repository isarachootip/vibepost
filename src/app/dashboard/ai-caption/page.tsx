import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AICaptionClient } from "./AICaptionClient";

async function getUserWorkspaceRole(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.email) return null;
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!dbUser) return null;
  if (dbUser.role === "ADMIN") return "ADMIN";
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    select: { role: true },
  });
  return member?.role ?? "VIEWER";
}

export default async function AICaptionPage() {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) {
    return <div className="p-8 text-foreground">Please create a workspace first.</div>;
  }

  const role = await getUserWorkspaceRole(workspace.id);
  const isViewer = role === "VIEWER";

  if (isViewer) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          AI Caption Generator
        </h1>
        <div className="flex items-start gap-4 p-5 neu-raised rounded-2xl border border-amber-500/30 bg-amber-500/10 max-w-xl">
          <span className="text-3xl">👁️</span>
          <div>
            <h3 className="font-bold text-amber-700 dark:text-amber-300 mb-1">สิทธิ์ดูอย่างเดียว (Viewer)</h3>
            <p className="text-amber-700/90 dark:text-amber-200/90 text-sm">คุณไม่สามารถใช้งาน AI Caption ได้ กรุณาติดต่อ Workspace Admin เพื่อขอสิทธิ์เพิ่มเติม</p>
          </div>
        </div>
      </div>
    );
  }

  return <AICaptionClient />;
}
