"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  FileText,
  HelpCircle,
  History,
  Layers,
  LayoutDashboard,
  Send,
  Settings,
  Share2,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
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

export function SidebarNav() {
  const pathname = usePathname();

  function isItemActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex-1 px-3 space-y-4 overflow-y-auto custom-scrollbar py-1">
      {NAV_GROUPS.map((group) => (
        <div key={group.groupTitle} className="space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
            {group.groupTitle}
          </div>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 group ${
                    active
                      ? "neu-pressed border border-[var(--border)] text-primary-ink font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`size-4 shrink-0 transition-colors ${
                        active
                          ? "text-primary-ink"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {active && (
                    <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)] shrink-0" />
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
