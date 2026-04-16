import React from "react"
import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome, {session?.user?.name || "Creator"}</h1>
        <p className="text-zinc-400">Here&apos;s what&apos;s happening with your content today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-zinc-300">Total Posts</h3>
            <span className="text-blue-500 bg-blue-500/10 px-2 py-1 flex rounded-md text-xs font-medium">This Month</span>
          </div>
          <div className="text-4xl font-bold text-white">0</div>
          <p className="text-xs text-zinc-500 mt-2">Get started by creating a new post.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-zinc-300">Scheduled</h3>
            <span className="text-amber-500 bg-amber-500/10 px-2 py-1 flex rounded-md text-xs font-medium">Pending</span>
          </div>
          <div className="text-4xl font-bold text-white">0</div>
          <p className="text-xs text-zinc-500 mt-2">No posts waiting in queue.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-zinc-300">Connected Accounts</h3>
            <span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 flex rounded-md text-xs font-medium">Active</span>
          </div>
          <div className="text-4xl font-bold text-white">0</div>
          <p className="text-xs text-zinc-500 mt-2">Add Facebook or X to start publishing.</p>
        </div>
      </div>
      
      {/* Sample Empty State content */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Create your first content post</h3>
        <p className="text-zinc-400 max-w-md mx-auto mb-6">Connect your AI prompt configs and generate content automatically for all your social platforms.</p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#050505] active:scale-[0.98]">
          New Post Campaign
        </button>
      </div>
    </div>
  )
}
