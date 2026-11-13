import React from "react";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

interface DashboardHeroBannerProps {
  workspaceName: string;
  userName?: string | null;
}

export function DashboardHeroBanner({
  workspaceName,
  userName,
}: DashboardHeroBannerProps) {
  return (
    <section className="neu-raised neu-mesh-card neu-grain rounded-3xl border border-[var(--border)] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="space-y-3 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="neu-pressed inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-bold text-primary-ink border border-[var(--border)]">
            <Sparkles className="size-3.5" />
            <span>VibePost Omni-Studio · {workspaceName}</span>
          </span>
          <span className="neu-pressed inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-teal-500 dark:text-teal-400 border border-[var(--border)]">
            <span className="size-1.5 rounded-full bg-teal-400 animate-pulse" />
            Live Hub
          </span>
        </div>

        <h1 className="font-display text-2xl sm:text-4xl text-foreground leading-[1.15]">
          {userName ? `สวัสดี ${userName} — ` : ""}
          เริ่มต้นเนรมิต{" "}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-teal-400 bg-clip-text text-transparent">
            คอนเทนต์อัตโนมัติ
          </span>
        </h1>

        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
          สั่งงาน AI Studio สร้างบทความ ภาพ และวิดีโอ พร้อมกระจายโพสต์ไปยังทุกช่องทางโซเชียลของ{" "}
          <span className="font-bold text-foreground">{workspaceName}</span>{" "}
          ในสายพานเดียว
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <Link
          href="/dashboard/ai-studio"
          className="neu-raised inline-flex items-center gap-2 border border-[var(--border-control)] hover:border-primary/40 text-foreground px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all hover:-translate-y-0.5"
        >
          <Sparkles className="size-4 text-primary-ink" />
          <span>เปิด AI Studio</span>
        </Link>

        <Link
          href="/dashboard/multi-post"
          className="neu-tint-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all hover:brightness-110 hover:-translate-y-0.5"
        >
          <Plus className="size-4" />
          <span>สร้างโพสต์ใหม่</span>
        </Link>
      </div>
    </section>
  );
}
