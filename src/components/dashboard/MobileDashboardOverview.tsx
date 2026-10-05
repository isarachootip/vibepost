"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Calendar,
  Layers,
  Share2,
  Users,
  ArrowRight,
  Zap,
} from "lucide-react";

interface WorkspaceProps {
  id: string;
  name: string;
  _count: {
    posts: number;
    members: number;
  };
  socialConnections: Array<{ id: string; platform: string; accountName: string }>;
  promptConfigs: Array<{ id: string; name: string }>;
}

export function MobileDashboardOverview({
  workspace,
}: {
  workspace: WorkspaceProps;
}) {
  const stats = [
    {
      label: "โพสต์ทั้งหมด",
      value: workspace._count.posts,
      icon: Layers,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50",
      href: "/dashboard/history",
    },
    {
      label: "เชื่อมต่อโซเชียล",
      value: workspace.socialConnections.length,
      icon: Share2,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50",
      href: "/dashboard/social",
    },
    {
      label: "สมาชิกทีม",
      value: workspace._count.members,
      icon: Users,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/50",
      href: "/dashboard/workspaces",
    },
    {
      label: "AI Prompts",
      value: workspace.promptConfigs.length,
      icon: Sparkles,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Banner / Active Workspace Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-xs">
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-medium border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Workspace
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Artifact Kit</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            {workspace.name}
          </h2>
          <p className="text-xs text-slate-300 mb-4 line-clamp-1">
            ระบบจัดการและเผยแพร่คอนเทนต์อัตโนมัติด้วย AI
          </p>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/dashboard/ai-studio"
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-3 rounded-xl font-semibold text-xs transition-transform active:scale-95 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Studio</span>
            </Link>
            <Link
              href="/dashboard/multi-post"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2.5 px-3 rounded-xl font-semibold text-xs backdrop-blur-xs transition-transform active:scale-95 border border-white/10"
            >
              <Send className="w-4 h-4" />
              <span>สร้างโพสต์</span>
            </Link>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Quick Action Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
          เมนูลัด (Quick Actions)
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <Link
            href="/dashboard/ai-studio"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-[#181d27] border border-[#e4e7ee] dark:border-white/10 shadow-2xs hover:border-indigo-200 transition-all active:scale-95 text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">AI Studio</span>
          </Link>

          <Link
            href="/dashboard/monitor"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-[#181d27] border border-[#e4e7ee] dark:border-white/10 shadow-2xs hover:border-blue-200 transition-all active:scale-95 text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">คิวโพสต์</span>
          </Link>

          <Link
            href="/dashboard/history"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-[#181d27] border border-[#e4e7ee] dark:border-white/10 shadow-2xs hover:border-purple-200 transition-all active:scale-95 text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">คลังร่าง</span>
          </Link>

          <Link
            href="/dashboard/social"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-[#181d27] border border-[#e4e7ee] dark:border-white/10 shadow-2xs hover:border-emerald-200 transition-all active:scale-95 text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5">
              <Share2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">โซเชียล</span>
          </Link>
        </div>
      </div>

      {/* 4 Metrics */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
          สถิติภาพรวม (Key Metrics)
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="p-3.5 rounded-xl bg-white dark:bg-[#181d27] border border-[#e4e7ee] dark:border-white/10 shadow-2xs hover:shadow-xs transition-all active:scale-98 flex items-center justify-between"
              >
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {item.value}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.label}
                  </p>
                </div>
                <div className={`p-2 rounded-lg border ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3 Steps Pipeline */}
      <div className="rounded-xl bg-white dark:bg-[#181d27] border border-[#e4e7ee] dark:border-white/10 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-white/10">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            3 ขั้นตอนการทำงาน (Pipeline)
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Auto-Pilot</span>
        </div>

        <div className="space-y-2.5">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5">
            <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                ตั้งค่าแบรนด์ & AI Prompt
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                กำหนดสไตล์คำสั่งและช่องทางโซเชียล
              </p>
            </div>
            <Link
              href="/dashboard/settings"
              className="p-1 rounded-md bg-white dark:bg-slate-800 border border-[#e4e7ee] dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5">
            <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                AI สร้างแคปชัน & สื่อ
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                สร้างแคปชันพร้อมภาพและคลิปวิดีโอ
              </p>
            </div>
            <Link
              href="/dashboard/ai-studio"
              className="p-1 rounded-md bg-white dark:bg-slate-800 border border-[#e4e7ee] dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5">
            <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                ตั้งเวลา & โพสต์อัตโนมัติ
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                ยิงส่ง Social API ตามกำหนดเวลา
              </p>
            </div>
            <Link
              href="/dashboard/monitor"
              className="p-1 rounded-md bg-white dark:bg-slate-800 border border-[#e4e7ee] dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
