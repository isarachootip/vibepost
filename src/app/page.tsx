import { prisma } from '@/lib/prisma';
import { Activity, Plus, RefreshCw, Send, Users, Layers, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  // Fetch real data from Hostinger DB via Prisma
  const workspaces = await prisma.workspace.count();
  const users = await prisma.user.count();
  const activePlatforms = await prisma.socialConnection.count({ where: { isActive: true } });
  const recentPosts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { workspace: true }
  });

  return (
    <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Overview</h1>
          <p className="text-zinc-500 mt-1">Manage your workspaces and social auto-posting operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
            <RefreshCw className="w-4 h-4 text-zinc-500" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-md shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Workspaces" value={workspaces.toString()} icon={<Layers className="w-5 h-5 text-indigo-500" />} trend="+2 this week" />
        <MetricCard title="Registered Users" value={users.toString()} icon={<Users className="w-5 h-5 text-emerald-500" />} trend="+1 today" />
        <MetricCard title="Active Platforms" value={activePlatforms.toString()} icon={<Activity className="w-5 h-5 text-blue-500" />} trend="All systems normal" />
        <MetricCard title="Total Posts Sent" value="0" icon={<Send className="w-5 h-5 text-rose-500" />} trend="Pending configuration" />
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Posts Board */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Posts</h2>
            <Link href="/posts" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
          </div>
          
          {recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">No posts yet</h3>
              <p className="text-sm text-zinc-500 mt-1 max-w-sm">You haven't scheduled or published any posts through AutoPost AI yet.</p>
              <button className="mt-4 text-sm font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg">Get Started</button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{post.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400">
                        {post.status}
                      </span>
                      <span className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions / Integration Status */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Connect Your AI</h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-400/80 mb-4 tracking-wide leading-relaxed">
              Link your OpenAI, Gemini, or Claude account to unlock automated content generation for your workspace.
            </p>
            <Link href="/settings">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors py-2.5 rounded-xl text-sm font-medium">
                Configure Providers
              </button>
            </Link>
          </div>
          
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold mb-4">System Status</h3>
            <div className="space-y-3">
              <StatusRow label="Database" status="Connected" color="bg-emerald-500" />
              <StatusRow label="Worker Queue" status="Idle" color="bg-zinc-400" />
              <StatusRow label="Social Graph API" status="Unconfigured" color="bg-amber-500" />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h3>
        <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          {icon}
        </div>
      </div>
      <div>
        <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</span>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mt-1">{trend}</p>
      </div>
    </div>
  )
}

function StatusRow({ label, status, color }: { label: string, status: string, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{status}</span>
      </div>
    </div>
  )
}
