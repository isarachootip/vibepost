"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Share2,
  Sparkles,
  FileText,
  Send,
  Activity,
  History,
  Trash2,
  Zap,
  HelpCircle,
  Settings,
  BookOpen,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export function SidebarNav() {
  const pathname = usePathname();

  const groups: NavGroup[] = [
    {
      groupTitle: "General",
      items: [
        { label: "ภาพรวมระบบ", href: "/dashboard", icon: LayoutDashboard },
        { label: "Workspaces", href: "/dashboard/workspaces", icon: Layers },
        { label: "Integrations", href: "/dashboard/social", icon: Share2 },
      ],
    },
    {
      groupTitle: "AI Studio",
      items: [
        { label: "AI Studio", href: "/dashboard/ai-studio", icon: Sparkles },
        { label: "AI Caption", href: "/dashboard/ai-caption", icon: FileText },
        { label: "AI Publisher", href: "/dashboard/multi-post", icon: Send },
      ],
    },
    {
      groupTitle: "Operations",
      items: [
        { label: "Post Monitor", href: "/dashboard/monitor", icon: Activity },
        { label: "Post History", href: "/dashboard/history", icon: History },
        { label: "Automation", href: "/dashboard/automation", icon: Zap },
        { label: "Trash", href: "/dashboard/trash", icon: Trash2 },
      ],
    },
    {
      groupTitle: "Preferences",
      items: [
        { label: "คู่มือการใช้งาน", href: "/dashboard/manual", icon: BookOpen },
        { label: "KM & FAQ", href: "/dashboard/faq", icon: HelpCircle },
        { label: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  function isItemActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex-1 px-3 space-y-4 overflow-y-auto custom-scrollbar py-1">
      {groups.map((group) => (
        <div key={group.groupTitle} className="space-y-1">
          <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {group.groupTitle}
          </div>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all duration-150 group ${
                    active
                      ? "bg-[#edf0ff] dark:bg-[#2c304c] text-[#30327a] dark:text-[#e2e7fc] font-semibold shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`size-4 shrink-0 transition-colors ${
                        active
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0"></span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
