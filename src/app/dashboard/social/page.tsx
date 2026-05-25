import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { ConnectSocialModal } from "./ConnectSocialModal";
import { DisconnectSocialButton } from "./DisconnectSocialButton";

const PLATFORMS = [
  { id: "FACEBOOK", name: "Facebook Page", color: "bg-blue-600", icon: "F" },
  { id: "INSTAGRAM", name: "Instagram", color: "bg-pink-600", icon: "I" },
  { id: "TWITTER", name: "X (Twitter)", color: "bg-neutral-800", icon: "X" },
  { id: "LINKEDIN", name: "LinkedIn", color: "bg-blue-700", icon: "in" },
  { id: "LINE", name: "LINE OA", color: "bg-green-500", icon: "L" },
  { id: "TIKTOK", name: "TikTok", color: "bg-black", icon: "t" }
] as const;

export default async function SocialAccountsPage() {
  const workspace = await getActiveWorkspaceContext();

  if (!workspace) {
    return <div className="p-8 text-slate-900">Please create a workspace first.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out max-w-5xl mx-auto">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">การเชื่อมต่อโซเชียล</h1>
          <p className="text-slate-500 text-sm">เชื่อมต่อบัญชีโซเชียลมีเดียของคุณเพื่อเปิดใช้งานการโพสต์อัตโนมัติ</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLATFORMS.map((platform) => {
          const platformConnections = workspace.socialConnections.filter(c => c.platform === platform.id);
          const isConnected = platformConnections.length > 0;
          
          const buttonClass = `px-4 py-2 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] bg-white text-black hover:bg-neutral-200 focus:ring-white border border-slate-200`;

          return (
            <div key={platform.id} className="relative rounded-3xl border border-slate-200 bg-white p-6  overflow-hidden group shadow-lg">
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] -mr-16 -mt-16 opacity-20 pointer-events-none transition-opacity ${isConnected ? platform.color.replace('bg-', 'bg-') : 'bg-transparent'}`}></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-slate-900 font-bold text-xl shadow-lg border border-slate-200 ${platform.color}`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{platform.name}</h3>
                    <p className={`text-xs mt-1 font-medium ${isConnected ? 'text-green-600' : 'text-slate-500'}`}>
                      {platformConnections.length} บัญชีที่เชื่อมต่อ
                    </p>
                  </div>
                </div>

                <ConnectSocialModal 
                  platformId={platform.id}
                  platformName={platform.name}
                  buttonClass={buttonClass}
                />
              </div>

              {platformConnections.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200 relative z-10 flex flex-col gap-3">
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Connected Accounts</div>
                  {platformConnections.map((conn) => (
                    <div key={conn.id} className="flex items-center justify-between text-sm bg-slate-50 border border-slate-100 p-3 rounded-xl">
                      <span className="text-slate-700 font-semibold">{conn.accountName}</span>
                      <DisconnectSocialButton connectionId={conn.id} accountName={conn.accountName} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
