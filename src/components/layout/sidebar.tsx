import React from "react";
import Link from "next/link";
import { signOut } from "@/auth";
import type { Session } from "next-auth";
import { WorkspaceSwitcherClient } from "@/components/WorkspaceSwitcherClient";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { getUserWorkspaces } from "@/lib/actions/workspace";
import { cookies } from "next/headers";
import { LogOut, Sparkles } from "lucide-react";

export async function Sidebar({ session }: { session: Session | null }) {
  const workspaces = await getUserWorkspaces();
  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("activeWorkspaceId")?.value || null;

  return (
    <aside className="w-64 bg-[var(--surface)] flex flex-col h-full shrink-0 border-r border-[var(--border)] relative z-20 transition-colors">
      {/* Brand Header */}
      <Link
        href="/"
        className="p-4 flex items-center gap-3 hover:opacity-95 transition-opacity cursor-pointer text-left w-full outline-none group"
      >
        <div className="neu-tint-primary size-9 rounded-xl grid place-items-center shrink-0 transition-transform duration-200 group-hover:scale-105">
          <Sparkles className="size-4.5" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-sm text-foreground leading-tight truncate">
              VibePost
            </span>
            <span className="neu-pressed text-[10px] text-primary-ink font-bold px-2 py-0.5 rounded-full border border-[var(--border)]">
              Studio
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground truncate mt-0.5">
            AI Omni-Publisher
          </span>
        </div>
      </Link>

      {/* Workspace Switcher */}
      <WorkspaceSwitcherClient
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
      />

      {/* Dynamic Nav Groups */}
      <SidebarNav />

      {/* User Footer */}
      <div className="p-3 mt-auto border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="neu-raised flex items-center gap-2.5 p-2 rounded-2xl border border-[var(--border)]">
          <div className="neu-tint-primary size-8 rounded-xl font-extrabold flex items-center justify-center shrink-0 text-xs">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
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
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
