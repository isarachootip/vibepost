import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";

const PLATFORMS = [
  { id: "FACEBOOK", name: "Facebook Page", color: "bg-blue-600", icon: "F" },
  { id: "INSTAGRAM", name: "Instagram", color: "bg-pink-600", icon: "I" },
  { id: "TWITTER", name: "X (Twitter)", color: "bg-neutral-800", icon: "X" },
  { id: "LINKEDIN", name: "LinkedIn", color: "bg-blue-700", icon: "in" }
]

export default async function SocialAccountsPage() {
  const workspace = await getActiveWorkspaceContext();

  if (!workspace) {
    return <div className="p-8 text-white">Please create a workspace first.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out max-w-5xl mx-auto">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Social Connections</h1>
          <p className="text-zinc-400 text-sm">Connect your social media accounts to enable auto-posting.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLATFORMS.map((platform) => {
          const connection = workspace.socialConnections.find(c => c.platform === platform.id);
          const isConnected = !!connection;

          return (
            <div key={platform.id} className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] -mr-16 -mt-16 opacity-20 pointer-events-none transition-opacity ${isConnected ? platform.color.replace('bg-', 'bg-') : 'bg-transparent'}`}></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/10 ${platform.color}`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{platform.name}</h3>
                    <p className={`text-xs mt-1 font-medium ${isConnected ? 'text-green-400' : 'text-zinc-500'}`}>
                      {isConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>

                <button 
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] ${
                    isConnected 
                    ? "bg-white/5 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 border border-white/10" 
                    : "bg-white text-black hover:bg-neutral-200 focus:ring-white"
                  }`}
                >
                  {isConnected ? "Disconnect" : "Connect"}
                </button>
              </div>

              {isConnected && connection && (
                <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Connected Account</span>
                    <span className="text-zinc-300 font-medium">{connection.accountName}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
