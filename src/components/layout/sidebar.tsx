import React from "react";
import Link from "next/link";
import { signOut } from "@/auth";
import { Session } from "next-auth";
import { WorkspaceSwitcherClient } from "@/components/WorkspaceSwitcherClient";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { getUserWorkspaces } from "@/lib/actions/workspace";
import { cookies } from "next/headers";
import { LogOut } from "lucide-react";

export async function Sidebar({ session }: { session: Session | null }) {
  const workspaces = await getUserWorkspaces();
  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("activeWorkspaceId")?.value || null;

  return (
    <aside className="w-64 bg-[#f9fafd] dark:bg-[#181d27] flex flex-col h-full shrink-0 border-r border-[#e4e7ee] dark:border-white/10 relative z-20">
      {/* Brand Header */}
      <Link 
        href="/" 
        className="p-4 flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer text-left block w-full outline-none"
      >
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <path d="M12 4v16" />
            <path d="M4 12h16" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight leading-tight truncate">
              VibePost
            </span>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold px-1.5 py-0.2 rounded border border-indigo-200/60 dark:border-indigo-800/60">
              Artifact
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Admin Dashboard Kit
          </span>
        </div>
      </Link>

      {/* Workspace Switcher */}
      <WorkspaceSwitcherClient workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />

      {/* Dynamic Nav Groups */}
      <SidebarNav />

      {/* User Footer */}
      <div className="p-3 mt-auto border-t border-[#e4e7ee] dark:border-white/10 bg-white/50 dark:bg-[#181d27]">
        <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs border border-indigo-200/60 dark:border-indigo-800/60">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {session?.user?.email}
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              title="Log out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
