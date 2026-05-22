import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { MultiPostWizard } from "./MultiPostWizard";
import { Send } from "lucide-react";

export default async function MultiPostDemoPage() {
  const workspace = await getActiveWorkspaceContext();

  if (!workspace) {
    return <div className="p-8 text-white">Please create a workspace first.</div>;
  }

  // Pass only necessary serializable data
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-sm flex items-center gap-3">
            <Send className="w-8 h-8 text-indigo-400" />
            AI Content Publisher
          </h1>
          <p className="text-slate-400 font-medium tracking-wide">
            Automate your social presence across all channels with the power of AI.
          </p>
        </div>
      </header>

      {connections.length === 0 ? (
        <div className="bg-[#0f1423]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl text-center">
          <h2 className="text-xl text-white font-bold mb-2">No Social Connections Found</h2>
          <p className="text-slate-400">Please go to Settings &gt; Social Connections to link your accounts first.</p>
        </div>
      ) : (
        <MultiPostWizard connections={connections} />
      )}
    </div>
  );
}
