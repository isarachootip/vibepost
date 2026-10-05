"use client";

import React from "react";
import Link from "next/link";
import { useSidebar } from "./sidebar-context";
import { 
  Menu, 
  Bell, 
  Plus, 
  Sparkles 
} from "lucide-react";

export function Header() {
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <header className="h-14 md:h-16 border-b border-[#e4e7ee] dark:border-white/10 flex items-center justify-between px-4 md:px-6 shrink-0 bg-white/80 dark:bg-[#10141d]/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      
      {/* Left side: Mobile Hamburger + Breadcrumb/Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="size-5" />
        </button>

        {/* Mobile Logo Brand */}
        <div className="flex md:hidden items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
          <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-2xs">
            V
          </div>
          <span>VibePost</span>
        </div>

        {/* Workspace Ready Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-[#f2f4f9] dark:bg-[#181d27] border border-[#e4e7ee] dark:border-white/10 rounded-full px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            System Online
          </span>
        </div>
      </div>
      
      {/* Right side: Quick Action + Notification */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/dashboard/multi-post"
          className="hidden sm:inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="size-3.5" />
          <span>สร้างโพสต์</span>
        </Link>

        <Link
          href="/dashboard/ai-studio"
          className="hidden md:inline-flex items-center gap-1.5 bg-[#edf0ff] dark:bg-[#2c304c] hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
        >
          <Sparkles className="size-3.5" />
          <span>AI Studio</span>
        </Link>

        {/* Notification button */}
        <button 
          title="Notifications"
          className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-[#181d27] border border-[#e4e7ee] dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
