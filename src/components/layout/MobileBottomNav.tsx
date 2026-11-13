"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-context";
import {
  History,
  LayoutDashboard,
  Menu,
  PlusCircle,
  Sparkles,
} from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setIsOpen } = useSidebar();

  const navItems = [
    {
      label: "หน้าแรก",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      label: "AI Studio",
      href: "/dashboard/ai-studio",
      icon: Sparkles,
      isActive: pathname.startsWith("/dashboard/ai-studio"),
    },
    {
      label: "สร้างโพสต์",
      href: "/dashboard/multi-post",
      icon: PlusCircle,
      isActive: pathname.startsWith("/dashboard/multi-post"),
      isPrimary: true,
    },
    {
      label: "ประวัติ/ร่าง",
      href: "/dashboard/history",
      icon: History,
      isActive: pathname.startsWith("/dashboard/history"),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--sheet)]/95 backdrop-blur-xl border-t border-[var(--border)] px-3 py-1.5 shadow-[0_-8px_24px_var(--neu-dark)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5 group"
              >
                <div className="neu-tint-primary w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 active:scale-95">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-foreground mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                item.isActive
                  ? "text-primary-ink font-bold scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 ${
                  item.isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"
                }`}
              />
              <span className="text-[10px] font-semibold tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
          aria-label="เปิดเมนูเพิ่มเติม"
        >
          <Menu className="w-5 h-5 mb-0.5 stroke-[1.8px]" />
          <span className="text-[10px] font-semibold tracking-tight">เมนู</span>
        </button>
      </div>
    </div>
  );
}
