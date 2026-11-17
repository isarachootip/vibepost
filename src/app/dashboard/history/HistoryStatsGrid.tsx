"use client";

import React from "react";
import { Activity, CheckCircle2, FileText, Share2 } from "lucide-react";

interface HistoryStatsGridProps {
  totalPosts: number;
  successCount: number;
  totalChannels: number;
}

export function HistoryStatsGrid({
  totalPosts,
  successCount,
  totalChannels,
}: HistoryStatsGridProps) {
  const stats = [
    {
      label: "โพสต์ทั้งหมด",
      value: totalPosts,
      icon: <FileText className="w-5 h-5" />,
      badgeCls: "neu-tint-primary",
      valueCls: "text-primary",
    },
    {
      label: "สำเร็จครบทุกช่องทาง",
      value: successCount,
      icon: <CheckCircle2 className="w-5 h-5" />,
      badgeCls: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25",
      valueCls: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "แพลตฟอร์ม",
      value: totalChannels,
      icon: <Share2 className="w-5 h-5" />,
      badgeCls: "neu-tint-teal",
      valueCls: "text-teal-600 dark:text-teal-400",
    },
    {
      label: "อัตราสำเร็จ",
      value: totalPosts > 0 ? `${Math.round((successCount / totalPosts) * 100)}%` : "—",
      icon: <Activity className="w-5 h-5" />,
      badgeCls: "bg-amber-500/12 text-amber-600 dark:text-amber-300 border border-amber-500/25",
      valueCls: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="neu-raised neu-grain rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5"
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.badgeCls}`}>
            {stat.icon}
          </div>
          <div>
            <p className={`font-display text-2xl font-extrabold leading-none mb-1 ${stat.valueCls}`}>
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
