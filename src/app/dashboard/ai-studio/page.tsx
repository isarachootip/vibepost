import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AIStudioClient } from "./AIStudioClient";

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

export default async function AIStudioPage() {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) {
    return <div className="p-8 text-slate-800">Please create a workspace first.</div>;
  }

  const role = await getUserWorkspaceRole(workspace.id);
  const isViewer = role === "VIEWER";

  if (isViewer) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          AI Studio
        </h1>
        <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl max-w-xl">
          <span className="text-3xl">👁️</span>
          <div>
            <h3 className="font-bold text-amber-800 mb-1">สิทธิ์ดูอย่างเดียว (Viewer)</h3>
            <p className="text-amber-700 text-sm">คุณไม่สามารถใช้งานห้องสร้างผลงาน AI ได้ กรุณาติดต่อ Workspace Admin เพื่อขอสิทธิ์เพิ่มเติม</p>
          </div>
        </div>
      </div>
    );
  }

  const connections = workspace.socialConnections.map((c) => ({
    id: c.id,
    platform: c.platform,
    accountName: c.accountName,
    isActive: c.isActive,
  }));

  return <AIStudioClient connections={connections} />;
}
