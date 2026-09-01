"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Calendar,
  Layers,
  Settings,
  Share2,
  Users,
  CheckCircle2,
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
      color: "text-red-600 bg-red-50 border-red-100",
      href: "/dashboard/history",
    },
    {
      label: "เชื่อมต่อโซเชียล",
      value: workspace.socialConnections.length,
      icon: Share2,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      href: "/dashboard/social",
    },
    {
      label: "สมาชิกทีม",
      value: workspace._count.members,
      icon: Users,
      color: "text-purple-600 bg-purple-50 border-purple-100",
      href: "/dashboard/workspaces",
    },
    {
      label: "AI Prompts",
      value: workspace.promptConfigs.length,
      icon: Sparkles,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner / Active Workspace Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-5 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[11px] font-medium border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
              Workspace
            </span>
            <span className="text-[11px] text-slate-400">Mobile Hub</span>
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
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-2.5 px-3 rounded-xl font-semibold text-xs transition-transform active:scale-95 shadow-md shadow-red-600/30"
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
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Quick Action Grid (Touch Optimized) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
          เมนูลัด (Quick Actions)
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <Link
            href="/dashboard/ai-studio"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-red-200 transition-all active:scale-95 text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-1.5">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800">AI Studio</span>
          </Link>

          <Link
            href="/dashboard/monitor"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all active:scale-95 text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800">คิวโพสต์</span>
          </Link>

          <Link
            href="/dashboard/history"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-200 transition-all active:scale-95 text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800">คลังร่าง</span>
          </Link>

          <Link
            href="/dashboard/social"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all active:scale-95 text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800">โซเชียล</span>
          </Link>
        </div>
      </div>

      {/* 4 Metrics (Grid 2x2 on Mobile) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
          สถิติภาพรวม (Key Metrics)
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all active:scale-98 flex items-center justify-between"
              >
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {item.value}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {item.label}
                  </p>
                </div>
                <div className={`p-2 rounded-xl border ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3 Steps Pipeline (Mobile Vertical Stepper) */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            3 ขั้นตอนเริ่มทำงาน (Pipeline)
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Auto-Pilot</span>
        </div>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                ตั้งค่าแบรนด์ & AI Prompt
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                กำหนดสไตล์คำสั่งและช่องทางโซเชียล
              </p>
            </div>
            <Link
              href="/dashboard/settings"
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                AI สร้างแคปชัน & สื่อ
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                สร้าง 3 สไตล์พร้อมภาพและคลิปวิดีโอ
              </p>
            </div>
            <Link
              href="/dashboard/ai-studio"
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-200 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                ตั้งเวลา & โพสต์อัตโนมัติ
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                ยิงส่ง Social Graph API ตามกำหนด
              </p>
            </div>
            <Link
              href="/dashboard/monitor"
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
