import Link from 'next/link';
import { LayoutDashboard, MessageSquare, Megaphone, Settings, Plus } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Megaphone className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          AutoPost AI
        </h1>
      </div>
      
      <div className="px-4 py-4">
        <button className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm">
          <Plus className="w-4 h-4" />
          New Workspace
        </button>
      </div>

      <nav className="flex-1 p-4 pt-0 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 mt-4">Menu</p>
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium transition-colors">
          <LayoutDashboard className="w-5 h-5 text-indigo-500" />
          Dashboard
        </Link>
        <Link href="/platforms" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-medium transition-colors">
          <Megaphone className="w-5 h-5" />
          Platforms
        </Link>
        <Link href="/prompts" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-medium transition-colors">
          <MessageSquare className="w-5 h-5" />
          AI Prompts
        </Link>
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-medium transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
