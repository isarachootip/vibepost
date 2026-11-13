import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { ConnectSocialModal } from "./ConnectSocialModal";
import { DisconnectSocialButton } from "./DisconnectSocialButton";

const PLATFORMS = [
  { id: "FACEBOOK", name: "Facebook Page", color: "bg-blue-600", icon: "F" },
  { id: "INSTAGRAM", name: "Instagram", color: "bg-gradient-to-br from-amber-500 via-pink-600 to-purple-600", icon: "I" },
  { id: "TWITTER", name: "X (Twitter)", color: "bg-zinc-800", icon: "X" },
  { id: "LINKEDIN", name: "LinkedIn", color: "bg-sky-700", icon: "in" },
  { id: "LINE", name: "LINE OA", color: "bg-emerald-600", icon: "L" },
  { id: "TIKTOK", name: "TikTok", color: "bg-zinc-900", icon: "t" },
  { id: "YOUTUBE", name: "YouTube", color: "bg-rose-600", icon: "Y" },
] as const;

export default async function SocialAccountsPage() {
  const workspace = await getActiveWorkspaceContext();

  if (!workspace) {
    return (
      <div className="p-8 text-foreground">Please create a workspace first.</div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-foreground mb-1.5">
            การเชื่อมต่อโซเชียล
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            เชื่อมต่อบัญชีโซเชียลมีเดียของคุณเพื่อเปิดใช้งานการโพสต์อัตโนมัติ
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PLATFORMS.map((platform) => {
          const platformConnections = workspace.socialConnections.filter(
            (c) => c.platform === platform.id
          );
          const isConnected = platformConnections.length > 0;

          const buttonClass =
            "neu-tint-primary px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110 hover:-translate-y-0.5 cursor-pointer";

          return (
            <div
              key={platform.id}
              className="neu-raised neu-grain relative rounded-3xl border border-[var(--border)] p-6 overflow-hidden group transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between relative z-10 gap-3">
                <div className="flex items-center gap-4">
                  <div
                    className={`size-12 rounded-2xl flex items-center justify-center text-white font-display text-xl shadow-lg border border-white/15 shrink-0 ${platform.color}`}
                  >
                    {platform.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-base text-foreground">
                      {platform.name}
                    </h3>
                    <p
                      className={`text-xs mt-1 font-bold ${
                        isConnected
                          ? "text-emerald-500 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }`}
                    >
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
                <div className="mt-5 pt-5 border-t border-[var(--border)] relative z-10 flex flex-col gap-2.5">
                  <div className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">
                    Connected Accounts
                  </div>
                  {platformConnections.map((conn) => (
                    <div
                      key={conn.id}
                      className="neu-pressed flex items-center justify-between text-xs border border-[var(--border)] p-3 rounded-xl"
                    >
                      <span className="text-foreground font-bold truncate">
                        {conn.accountName}
                      </span>
                      <DisconnectSocialButton
                        connectionId={conn.id}
                        accountName={conn.accountName}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
