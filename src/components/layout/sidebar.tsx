import React from "react";
import Link from "next/link";
import { signOut } from "@/auth";
import { Session } from "next-auth";
import { WorkspaceSwitcherClient } from "@/components/WorkspaceSwitcherClient";
import { getUserWorkspaces } from "@/lib/actions/workspace";
import { cookies } from "next/headers";

export async function Sidebar({ session }: { session: Session | null }) {
  const workspaces = await getUserWorkspaces();
  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("activeWorkspaceId")?.value || null;

  return (
    <aside className="w-64 border-r border-white/10 bg-white/[0.03] backdrop-blur-3xl flex flex-col h-full shrink-0 shadow-[4px_0_30px_rgba(0,0,0,0.1)] relative z-20">
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
      <Link href="/" className="p-6 flex items-center gap-3 pb-6 hover:opacity-80 transition-opacity cursor-pointer text-left block w-full outline-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center relative shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e879f9" />
                  <stop offset="40%" stopColor="#c084fc" />
                  <stop offset="60%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#7e22ce" />
                </linearGradient>
              </defs>
              <path d="M10,25 L50,85 L90,25 L75,25 L50,60 L25,25 Z" fill="url(#logoGradient)" />
              <path d="M5,20 L45,80 L55,80 L95,20 L80,20 L50,65 L20,20 Z" fill="url(#logoGradient)" opacity="0.6" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-semibold text-lg tracking-[0.25em] bg-gradient-to-r from-fuchsia-200 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm leading-tight">VIBE POST</span>
            <span className="font-serif text-[0.55rem] text-fuchsia-200/60 italic tracking-widest mt-0.5" style={{fontFamily: "'Playfair Display', serif"}}>Social Media Management</span>
          </div>
        </div>
      </Link>

      <WorkspaceSwitcherClient workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />

      <nav className="flex-1 px-4 space-y-1.5 mt-2">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm transition-all border border-white/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative group backdrop-blur-md">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 group-hover:scale-110 transition-transform"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          Overview
        </Link>
        <Link href="/dashboard/workspaces" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium text-sm group">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-blue-400 transition-colors"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="m3 12.5 5 5 12-12"/></svg>
          Workspaces
        </Link>
        <Link href="/dashboard/posts" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium text-sm group">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-fuchsia-400 transition-colors"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Content Hub
        </Link>
        <Link href="/dashboard/social" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium text-sm group">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-cyan-400 transition-colors"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          Integrations
        </Link>
        <Link href="/dashboard/multi-post" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium text-sm group">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-emerald-400 transition-colors"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7Z"/></svg>
          Auto-Post Demo
        </Link>
        <Link href="/dashboard/history" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium text-sm group">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-amber-400 transition-colors"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
          Post History
        </Link>
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium text-sm group">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-slate-100 transition-colors"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          Settings
        </Link>
      </nav>

      <div className="p-5 mt-auto">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 relative overflow-hidden group hover:bg-white/10 transition-all shadow-md backdrop-blur-md">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white/10 text-white font-bold flex items-center justify-center shrink-0 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{session?.user?.name || "User"}</p>
              <p className="text-xs text-slate-300 truncate">{session?.user?.email}</p>
            </div>
          </div>
          <form action={async () => {
             "use server"
             await signOut()
          }} className="mt-4 relative z-10">
            <button className="w-full rounded-xl py-2 px-3 text-xs font-semibold bg-white/5 text-slate-300 hover:bg-red-500/20 hover:text-red-300 border border-white/10 hover:border-red-500/30 transition-all shadow-sm">
              Log out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
