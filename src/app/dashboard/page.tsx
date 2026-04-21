import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import Link from "next/link";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const session = await auth();
  const workspace = await getActiveWorkspaceContext();

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <div className="w-16 h-16 bg-[#1E293B] border border-slate-700/50 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-black/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Workspace Found</h2>
        <p className="text-slate-400 max-w-sm mb-6">System requires an active workspace node to function. Initialize a new matrix or contact support.</p>
        <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)]">Create Workspace</button>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 font-heading tracking-tight drop-shadow-sm">
            System Overview
          </h1>
          <p className="text-slate-300 font-medium tracking-wide">Manage auto-post workflow for <span className="text-blue-400 font-bold">{workspace.name}</span></p>
        </div>
        <Link href="/dashboard/posts" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
          New Campaign
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
      </header>

      {/* NEW: 3 Steps Workflow mimicking the provided image */}
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-[3rem] pointer-events-none"></div>
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-10 shadow-2xl shadow-black/40 backdrop-blur-3xl relative overflow-hidden">
          
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold font-heading text-white drop-shadow-sm mb-3">3 ขั้นตอนการทำงานจากไอเดียสู่การโพสต์อัตโนมัติ</h2>
            <p className="text-slate-400 text-sm">พลิกโฉมการทำคอนเทนต์ด้วยระบบ Social Auto-Post อัจฉริยะ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-start">
            {/* Connection Line Behind */}
            <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-500/0 via-slate-600 to-indigo-500/0 z-0"></div>

            {/* STEP 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-blue-400 transition-colors flex items-center justify-center mb-6 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">1. Setup Brand & Prompt</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-[200px]">ตั้งค่าข้อมูลแบรนด์และกำหนดสไตล์คำสั่ง (Prompts) ให้กับ AI</p>
              
              <Link href="/dashboard/settings" className="px-5 py-2 rounded-full border border-blue-500/50 text-blue-400 text-xs font-bold hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] z-20">
                {workspace.promptConfigs.length > 0 ? "Edit Configs" : "Start Setup"}
              </Link>
            </div>

            {/* STEP 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-purple-400 transition-colors flex items-center justify-center mb-6 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">2. AI Drafts & Human Review</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-[220px]">AI สร้างเนื้อหาแล้วส่งไปแจ้งเตือนผ่าน Discord เพื่อให้ผู้อนุมัติ</p>
              <button className="px-5 py-2 rounded-full border border-purple-500/50 text-purple-400 text-xs font-bold hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] z-20">
                View Drafts
              </button>
            </div>

            {/* STEP 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-emerald-400 transition-colors flex items-center justify-center mb-6 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14v4"/><path d="M10 16h4"/></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">3. Scheduling & Auto-Post</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-[220px]">ระบบนำคอนเทนต์ที่ผ่านการอนุมัติไปโพสต์โซเชียลมีเดียตามเวลาที่กำหนดไว้</p>
              <Link href="/dashboard/social" className="px-5 py-2 rounded-full border border-emerald-500/50 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_15px_rgba(52,211,153,0.15)] z-20">
                Manage Channels
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Posts", value: workspace._count.posts, link: "/dashboard/posts", color: "text-blue-400" },
          { label: "Connected Accounts", value: workspace.socialConnections.length, link: "/dashboard/social", color: "text-purple-400" },
          { label: "Team Members", value: workspace._count.members, link: "/dashboard/workspaces", color: "text-slate-100" },
          { label: "AI Configs", value: workspace.promptConfigs.length, link: "/dashboard/settings", color: "text-emerald-400" }
        ].map((stat, idx) => (
          <div key={idx} className="relative group overflow-hidden rounded-[2rem] p-6 transition-all hover:-translate-y-1 shadow-lg shadow-black/20 hover:shadow-[0_10px_30px_rgba(59,130,246,0.1)] bg-white/5 border border-white/10 text-center backdrop-blur-xl">
            <p className={`text-5xl font-extrabold font-heading mb-2 tracking-tight drop-shadow-sm ${stat.color}`}>{stat.value}</p>
            <p className="text-sm font-semibold tracking-wide text-slate-300">{stat.label}</p>
            <Link href={stat.link} className="absolute inset-0 z-10"><span className="sr-only">View {stat.label}</span></Link>
          </div>
        ))}
      </div>
    </div>
  );
}
