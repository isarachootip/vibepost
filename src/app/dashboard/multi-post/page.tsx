import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MultiPostWizard } from "./MultiPostWizard";
import { Send } from "lucide-react";

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

export default async function MultiPostDemoPage() {
  const workspace = await getActiveWorkspaceContext();

  if (!workspace) {
    return <div className="p-8 text-slate-800">Please create a workspace first.</div>;
  }

  const role = await getUserWorkspaceRole(workspace.id);
  const isViewer = role === "VIEWER";

  const connections = workspace.socialConnections.map(c => ({
    id: c.id,
    platform: c.platform,
    accountName: c.accountName,
    isActive: c.isActive
  }));

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 ease-out min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight drop-shadow-sm flex items-center gap-3">
            <Send className="w-8 h-8 text-red-600" />
            AI Content Publisher
          </h1>
          <p className="text-slate-500 font-medium tracking-wide">
            Automate your social presence across all channels with the power of AI.
          </p>
        </div>

        {/* Role Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border self-start md:self-auto ${
          role === "ADMIN" ? "bg-red-50 text-red-700 border-red-200" :
          role === "MEMBER" ? "bg-blue-50 text-blue-700 border-blue-200" :
          "bg-slate-100 text-slate-500 border-slate-200"
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            role === "ADMIN" ? "bg-red-500" :
            role === "MEMBER" ? "bg-blue-500" : "bg-slate-400"
          }`} />
          {role === "ADMIN" ? "🔑 Admin" : role === "MEMBER" ? "👤 Member" : "👁️ Viewer"}
        </div>
      </header>

      {/* Viewer Banner */}
      {isViewer && (
        <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
          <span className="text-3xl">👁️</span>
          <div>
            <h3 className="font-bold text-amber-800 mb-1">สิทธิ์ดูอย่างเดียว (Viewer)</h3>
            <p className="text-amber-700 text-sm">คุณสามารถดูประวัติการโพสต์ใน <strong>Post History</strong> ได้ แต่ไม่สามารถสร้างหรือกำหนดเวลาโพสต์ใหม่ได้ กรุณาติดต่อ Workspace Admin เพื่อขอสิทธิ์เพิ่มเติม</p>
          </div>
        </div>
      )}

      {connections.length === 0 && !isViewer ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
          <h2 className="text-xl text-slate-800 font-bold mb-2">No Social Connections Found</h2>
          <p className="text-slate-500">Please go to Settings &gt; Social Connections to link your accounts first.</p>
        </div>
      ) : !isViewer ? (
        <MultiPostWizard connections={connections} />
      ) : null}
    </div>
  );
}
