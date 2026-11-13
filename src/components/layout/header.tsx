"use client";

import React from "react";
import Link from "next/link";
import { useSidebar } from "./sidebar-context";
import { Bell, Menu, Plus, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <header className="h-14 md:h-16 border-b border-[var(--border)] flex items-center justify-between px-4 md:px-6 shrink-0 bg-[var(--sheet)]/90 backdrop-blur-xl sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Hamburger + Brand + Status Pill */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="neu-raised md:hidden p-1.5 rounded-xl border border-[var(--border-control)] text-foreground focus:outline-none transition-all cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="size-5" />
        </button>

        {/* Mobile Brand */}
        <Link href="/dashboard" className="flex md:hidden items-center gap-2 font-display text-foreground text-sm">
          <div className="neu-tint-primary size-7 rounded-lg grid place-items-center text-xs font-extrabold">
            V
          </div>
          <span>VibePost</span>
        </Link>

        {/* Tactile Status Pill */}
        <div className="neu-pressed hidden sm:flex items-center gap-2 border border-[var(--border)] rounded-full px-3.5 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold text-foreground/90">
            System Online
          </span>
        </div>
      </div>

      {/* Right: Quick Studio CTAs + Notifications + ThemeToggle */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <Link
          href="/dashboard/multi-post"
          className="neu-tint-primary hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all hover:brightness-110 hover:-translate-y-0.5"
        >
          <Plus className="size-3.5" />
          <span>สร้างโพสต์</span>
        </Link>

        <Link
          href="/dashboard/ai-studio"
          className="neu-raised hidden md:inline-flex items-center gap-1.5 border border-[var(--border-control)] hover:border-primary/40 text-primary-ink text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:-translate-y-0.5"
        >
          <Sparkles className="size-3.5" />
          <span>AI Studio</span>
        </Link>

        <Link
          href="/dashboard/monitor"
          title="Post Monitor & Notifications"
          className="neu-raised relative size-8 sm:size-9 grid place-items-center rounded-xl border border-[var(--border-control)] text-muted-foreground hover:text-foreground transition-all hover:-translate-y-0.5"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 bg-teal-400 rounded-full" />
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
