"use client";

import React from "react";

export interface StudioAIUsageStats {
  totalCost: number;
  totalTokens: number;
  totalCalls: number;
  articleCalls: number;
  imageCalls: number;
  videoCalls: number;
}

export function StudioUsageStatsBar({ stats }: { stats: StudioAIUsageStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 neu-raised neu-mesh-card neu-grain p-6 rounded-3xl">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          ค่าใช้จ่ายสะสม (Est. Cost)
        </span>
        <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground tracking-tight flex items-baseline gap-1">
          ${stats.totalCost.toFixed(5)}
          <span className="text-xs font-bold text-muted-foreground">USD</span>
        </h3>
        <span className="text-[11px] text-primary font-bold block">
          ≈ {(stats.totalCost * 34.5).toFixed(2)} บาท (THB)
        </span>
      </div>

      <div className="space-y-1 border-l border-border/60 pl-5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Token ทั้งหมดที่ใช้งาน
        </span>
        <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground tracking-tight flex items-baseline gap-1">
          {stats.totalTokens.toLocaleString()}
          <span className="text-xs font-bold text-muted-foreground">Tokens</span>
        </h3>
        <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold block">
          เรียกใช้งาน AI รวม {stats.totalCalls} ครั้ง
        </span>
      </div>

      <div className="space-y-1 border-l border-border/60 pl-5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          โมดูลเขียนข้อความ (Article)
        </span>
        <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
          {stats.articleCalls}{" "}
          <span className="text-xs font-bold text-muted-foreground">ครั้ง</span>
        </h3>
        <span className="text-[11px] text-muted-foreground font-medium block">
          Gemini &amp; LLM
        </span>
      </div>

      <div className="space-y-1 border-l border-border/60 pl-5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          โมดูลสร้างสื่อภาพ/วิดีโอ (Media)
        </span>
        <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
          {stats.imageCalls + stats.videoCalls}{" "}
          <span className="text-xs font-bold text-muted-foreground">ครั้ง</span>
        </h3>
        <span className="text-[11px] text-muted-foreground font-medium block">
          Imagen &amp; Google Flow (Veo 3.1)
        </span>
      </div>
    </div>
  );
}
