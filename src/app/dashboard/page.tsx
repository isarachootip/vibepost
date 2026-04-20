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
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
        </div>
        <h2 className="text-xl font-medium text-white mb-2">No Workspace Found</h2>
        <p className="text-zinc-400 max-w-sm mb-6">You need an active workspace to manage content. Please contact support or create a new workspace.</p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Create Workspace</button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Welcome, {session?.user?.name || "User"}
        </h1>
        <p className="text-zinc-400">Here's what is happening in <span className="text-white font-medium">{workspace.name}</span> today.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: workspace._count.posts, link: "/dashboard/posts" },
          { label: "Social Accounts", value: workspace.socialConnections.length, link: "/dashboard/social" },
          { label: "Team Members", value: workspace._count.members, link: "/dashboard/workspaces" },
          { label: "AI Models Configured", value: workspace.promptConfigs.length, link: "/dashboard/settings" }
        ].map((stat, idx) => (
          <div key={idx} className="relative group overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 p-6 backdrop-blur-md hover:bg-white/[0.04] transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            
            <p className="text-sm font-medium text-zinc-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold tracking-tight text-white mb-4">{stat.value}</p>
            
            <Link href={stat.link} className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
              Manage
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="text-lg font-medium text-white mb-4">Recent Content</h3>
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <p className="text-zinc-500 text-sm mb-4">No content has been created yet.</p>
              <Link href="/dashboard/posts" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2 rounded-lg text-sm transition-colors">
                Create First Post
              </Link>
            </div>
         </div>
         <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-blue-900/20 to-zinc-900/40 p-6 backdrop-blur-xl">
             <h3 className="text-lg font-medium text-white mb-4">Setup Checklist</h3>
             <ul className="space-y-4">
               {[
                 { text: "Connect Facebook/Instagram", done: workspace.socialConnections.length > 0, link: "/dashboard/social" },
                 { text: "Configure AI Prompts", done: workspace.promptConfigs.length > 0, link: "/dashboard/settings" },
                 { text: "Invite Team Members", done: workspace._count.members > 1, link: "/dashboard/workspaces" },
               ].map((item, i) => (
                 <li key={i} className="flex flex-col">
                   <div className="flex items-center gap-3">
                     <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 border border-white/10 text-transparent'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                     </div>
                     <span className={`text-sm ${item.done ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{item.text}</span>
                   </div>
                   {!item.done && (
                     <Link href={item.link} className="ml-8 mt-1 text-xs text-blue-400 hover:underline">Complete setup &rarr;</Link>
                   )}
                 </li>
               ))}
             </ul>
         </div>
      </div>
    </div>
  );
}
