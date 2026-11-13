"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Layers,
  Send,
  Share2,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export interface MobileWorkspaceProps {
  id: string;
  name: string;
  _count: {
    posts: number;
    members: number;
  };
  socialConnections: Array<{ id: string; platform: string; accountName: string }>;
  promptConfigs: Array<{ id: string; provider: string }>;
}

export function MobileDashboardOverview({
  workspace,
}: {
  workspace: MobileWorkspaceProps;
}) {
  const quickActions = [
    { label: "AI Studio", href: "/dashboard/ai-studio", icon: Zap, tint: "neu-tint-primary" },
    { label: "คิวโพสต์", href: "/dashboard/monitor", icon: Calendar, tint: "neu-tint-teal" },
    { label: "คลังร่าง", href: "/dashboard/history", icon: Layers, tint: "bg-indigo-500/20 text-primary-ink" },
    { label: "โซเชียล", href: "/dashboard/social", icon: Share2, tint: "bg-emerald-500/20 text-emerald-400" },
  ];

  const stats = [
    { label: "โพสต์ทั้งหมด", value: workspace._count.posts, icon: Layers, href: "/dashboard/history", tint: "neu-tint-primary" },
    { label: "เชื่อมต่อโซเชียล", value: workspace.socialConnections.length, icon: Share2, href: "/dashboard/social", tint: "neu-tint-teal" },
    { label: "สมาชิกทีม", value: workspace._count.members, icon: Users, href: "/dashboard/workspaces", tint: "bg-indigo-500/20 text-primary-ink" },
    { label: "AI Prompts", value: workspace.promptConfigs.length, icon: Sparkles, href: "/dashboard/settings", tint: "bg-emerald-500/20 text-emerald-400" },
  ];

  const steps = [
    { n: "1", title: "ตั้งค่าแบรนด์ & AI Prompt", desc: "กำหนดสไตล์คำสั่งและช่องทางโซเชียล", href: "/dashboard/settings" },
    { n: "2", title: "AI สร้างแคปชัน & สื่อ", desc: "สร้างแคปชันพร้อมภาพและคลิปวิดีโอ", href: "/dashboard/ai-studio" },
    { n: "3", title: "ตั้งเวลา & โพสต์อัตโนมัติ", desc: "ยิงส่ง Social API ตามกำหนดเวลา", href: "/dashboard/monitor" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="neu-raised neu-mesh-card neu-grain rounded-3xl border border-[var(--border)] p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="neu-pressed inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-primary-ink border border-[var(--border)]">
            <span className="size-1.5 rounded-full bg-teal-400 animate-pulse" />
            Workspace
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">Omni-Studio</span>
        </div>

        <div>
          <h2 className="font-display text-xl text-foreground">{workspace.name}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            ระบบจัดการและเผยแพร่คอนเทนต์อัตโนมัติด้วย AI
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/dashboard/ai-studio"
            className="neu-tint-primary flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs active:scale-95 transition-transform"
          >
            <Sparkles className="size-4" />
            <span>AI Studio</span>
          </Link>
          <Link
            href="/dashboard/multi-post"
            className="neu-raised flex items-center justify-center gap-2 border border-[var(--border-control)] text-foreground py-2.5 px-3 rounded-xl font-bold text-xs active:scale-95 transition-transform"
          >
            <Send className="size-4 text-primary-ink" />
            <span>สร้างโพสต์</span>
          </Link>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2 px-1">
          เมนูลัด (Quick Actions)
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="neu-raised flex flex-col items-center justify-center p-3 rounded-2xl border border-[var(--border)] active:scale-95 transition-transform text-center"
              >
                <div className={`size-9 rounded-xl grid place-items-center mb-1.5 ${item.tint}`}>
                  <Icon className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-foreground">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2 px-1">
          สถิติภาพรวม (Key Metrics)
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="neu-raised p-3.5 rounded-2xl border border-[var(--border)] flex items-center justify-between active:scale-98 transition-transform"
              >
                <div>
                  <p className="font-display text-2xl text-foreground tabular-nums">
                    {item.value}
                  </p>
                  <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                    {item.label}
                  </p>
                </div>
                <div className={`grid size-9 place-items-center rounded-xl ${item.tint}`}>
                  <Icon className="size-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="neu-raised rounded-3xl border border-[var(--border)] p-4 space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <h3 className="font-display text-xs text-foreground flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            <span>3 ขั้นตอนการทำงาน</span>
          </h3>
          <span className="font-mono text-[10px] text-primary-ink font-bold">Auto-Pilot</span>
        </div>

        {steps.map((step) => (
          <div
            key={step.n}
            className="neu-pressed flex items-center gap-3 p-2.5 rounded-xl border border-[var(--border)]"
          >
            <div className="neu-tint-primary size-6 rounded-lg font-bold text-xs grid place-items-center shrink-0">
              {step.n}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-foreground leading-tight">{step.title}</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{step.desc}</p>
            </div>
            <Link
              href={step.href}
              className="neu-raised p-1.5 rounded-lg border border-[var(--border)] text-muted-foreground hover:text-primary-ink"
            >
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
