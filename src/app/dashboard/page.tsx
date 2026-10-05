import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import Link from "next/link";
import { auth } from "@/auth";
import { MobileDashboardOverview } from "@/components/dashboard/MobileDashboardOverview";
import { 
  ArrowRight, 
  Layers, 
  Share2, 
  Users, 
  Sparkles, 
  Plus, 
  FileText, 
  Send,
  Sliders,
  CalendarCheck
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const session = await auth();
  const workspace = await getActiveWorkspaceContext();

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center h-[60vh]">
        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-center mb-4 shadow-2xs">
          <Layers className="size-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Workspace Found</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 text-sm">
          จำเป็นต้องเลือกหรือสร้าง Workspace เพื่อเริ่มต้นใช้งานระบบ Auto-Post
        </p>
        <Link 
          href="/dashboard/workspaces" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-2xs"
        >
          สร้าง Workspace ใหม่
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile-Optimized Dashboard Screen */}
      <div className="block md:hidden">
        <MobileDashboardOverview workspace={workspace as any} />
      </div>

      {/* Desktop Dashboard Screen */}
      <div className="hidden md:block space-y-6 animate-in fade-in duration-300">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e4e7ee] dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                ภาพรวมระบบ
              </h1>
              <span className="text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
                Live Hub
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              จัดการระบบผลิตและโพสต์คอนเทนต์อัตโนมัติสำหรับ{" "}
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{workspace.name}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard/ai-studio"
              className="inline-flex items-center gap-1.5 bg-white dark:bg-[#181d27] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#e4e7ee] dark:border-white/10 px-3.5 py-2 rounded-lg font-medium text-xs shadow-2xs transition-colors"
            >
              <Sparkles className="size-3.5 text-indigo-600" />
              <span>AI Studio</span>
            </Link>
            
            <Link 
              href="/dashboard/multi-post" 
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-xs transition-colors shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>สร้างโพสต์ใหม่</span>
            </Link>
          </div>
        </header>

        {/* 4 Cruip Artifact Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: "โพสต์ทั้งหมด", 
              value: workspace._count.posts, 
              link: "/dashboard/history", 
              icon: Layers,
              badge: "Total Posts",
              color: "text-indigo-600 dark:text-indigo-400",
              bg: "bg-indigo-50 dark:bg-indigo-950/50" 
            },
            { 
              label: "เชื่อมต่อโซเชียล", 
              value: workspace.socialConnections.length, 
              link: "/dashboard/social", 
              icon: Share2,
              badge: "Active Channels",
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-950/50" 
            },
            { 
              label: "สมาชิกทีม", 
              value: workspace._count.members, 
              link: "/dashboard/workspaces", 
              icon: Users,
              badge: "Team Members",
              color: "text-purple-600 dark:text-purple-400",
              bg: "bg-purple-50 dark:bg-purple-950/50" 
            },
            { 
              label: "AI Prompt Configs", 
              value: workspace.promptConfigs.length, 
              link: "/dashboard/settings", 
              icon: Sliders,
              badge: "Ready Prompts",
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/50" 
            }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Link 
                key={idx} 
                href={stat.link}
                className="group p-5 rounded-xl border border-[#e4e7ee] dark:border-white/10 bg-white dark:bg-[#181d27] shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-150 relative block"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </span>
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                    <Icon className="size-4" />
                  </div>
                </div>
                
                <div className="flex items-baseline justify-between">
                  <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <span className="text-[10px] font-medium text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-0.5 transition-colors">
                    {stat.badge}
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 3 Steps Pipeline Workflow Card */}
        <div className="rounded-xl border border-[#e4e7ee] dark:border-white/10 bg-white dark:bg-[#181d27] p-6 sm:p-8 shadow-2xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 pb-4 border-b border-slate-100 dark:border-white/10">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                3 ขั้นตอนการทำงานจากไอเดียสู่การโพสต์อัตโนมัติ
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                กระบวนการทำงานอัตโนมัติที่เชื่อมโยง AI กับเครือข่ายโซเชียลของคุณ
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200/60 dark:border-indigo-800/60 self-start sm:self-auto">
              Automated Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative items-start">
            {/* STEP 1 */}
            <div className="relative z-10 flex flex-col items-center text-center p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800/50 hover:border-indigo-200 transition-all duration-150 group">
              <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-[#e4e7ee] dark:border-white/10 text-indigo-600 flex items-center justify-center mb-4 shadow-2xs group-hover:border-indigo-300">
                <Sliders className="size-6 text-indigo-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 transition-colors">
                1. Setup Brand & Prompt
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 min-h-[36px]">
                ตั้งค่าข้อมูลแบรนด์ โทนเสียง และคำสั่ง Prompt สำหรับให้ AI สร้างคอนเทนต์
              </p>
              
              <Link 
                href="/dashboard/settings" 
                className="w-full py-1.5 px-3 rounded-lg border border-[#e4e7ee] dark:border-white/10 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 text-xs font-medium hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs text-center"
              >
                {workspace.promptConfigs.length > 0 ? "จัดการการตั้งค่า" : "เริ่มตั้งค่า"}
              </Link>
            </div>

            {/* STEP 2 */}
            <div className="relative z-10 flex flex-col items-center text-center p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800/50 hover:border-purple-200 transition-all duration-150 group">
              <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-[#e4e7ee] dark:border-white/10 text-purple-600 flex items-center justify-center mb-4 shadow-2xs group-hover:border-purple-300">
                <Sparkles className="size-6 text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-purple-600 transition-colors">
                2. AI Generation & Studio
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 min-h-[36px]">
                AI ผลิตแคปชัน 3 สไตล์พร้อมสื่อรูปภาพและวิดีโอเพื่อตรวจสอบและอนุมัติ
              </p>
              <Link 
                href="/dashboard/ai-studio"
                className="w-full py-1.5 px-3 rounded-lg border border-[#e4e7ee] dark:border-white/10 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 text-xs font-medium hover:border-purple-300 hover:text-purple-600 transition-colors shadow-2xs text-center"
              >
                เปิด AI Studio
              </Link>
            </div>

            {/* STEP 3 */}
            <div className="relative z-10 flex flex-col items-center text-center p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800/50 hover:border-emerald-200 transition-all duration-150 group">
              <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-[#e4e7ee] dark:border-white/10 text-emerald-600 flex items-center justify-center mb-4 shadow-2xs group-hover:border-emerald-300">
                <CalendarCheck className="size-6 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-emerald-600 transition-colors">
                3. Schedule & Auto-Publish
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 min-h-[36px]">
                ตั้งเวลาและยิงส่งคอนเทนต์ไปยัง Facebook Page, Instagram, TikTok อัตโนมัติ
              </p>
              <Link 
                href="/dashboard/social" 
                className="w-full py-1.5 px-3 rounded-lg border border-[#e4e7ee] dark:border-white/10 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 text-xs font-medium hover:border-emerald-300 hover:text-emerald-600 transition-colors shadow-2xs text-center"
              >
                จัดการช่องทางเชื่อมต่อ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
