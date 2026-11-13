import React from "react";
import Link from "next/link";
import { ArrowRight, Layers, Share2, Sliders, Users } from "lucide-react";

export interface DashboardMetricsData {
  postsCount: number;
  connectionsCount: number;
  membersCount: number;
  promptsCount: number;
}

export function DashboardStatsGrid({ metrics }: { metrics: DashboardMetricsData }) {
  const stats = [
    {
      label: "โพสต์ทั้งหมด",
      value: metrics.postsCount,
      link: "/dashboard/history",
      icon: Layers,
      badge: "Total Posts",
      iconBg: "neu-tint-primary",
    },
    {
      label: "เชื่อมต่อโซเชียล",
      value: metrics.connectionsCount,
      link: "/dashboard/social",
      icon: Share2,
      badge: "Active Channels",
      iconBg: "neu-tint-teal",
    },
    {
      label: "สมาชิกทีม",
      value: metrics.membersCount,
      link: "/dashboard/workspaces",
      icon: Users,
      badge: "Team Members",
      iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-[0_6px_18px_-4px_rgba(79,70,229,0.5)]",
    },
    {
      label: "AI Prompt Configs",
      value: metrics.promptsCount,
      link: "/dashboard/settings",
      icon: Sliders,
      badge: "Ready Prompts",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_6px_18px_-4px_rgba(16,185,129,0.45)]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link
            key={stat.badge}
            href={stat.link}
            className="neu-raised neu-grain group rounded-3xl border border-[var(--border)] p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div className="flex items-center justify-between gap-2">
              <div className={`grid size-11 place-items-center rounded-2xl shrink-0 ${stat.iconBg}`}>
                <Icon className="size-5" />
              </div>
              <span className="neu-pressed rounded-full px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground border border-[var(--border)] truncate">
                {stat.badge}
              </span>
            </div>

            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="font-display text-3xl text-foreground tabular-nums leading-none">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold text-muted-foreground mt-1.5">
                  {stat.label}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-ink transition-transform group-hover:translate-x-1">
                <span>เปิดดู</span>
                <ArrowRight className="size-3.5" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
