"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import {
  AIUsageStats,
  formatHistoryDate,
  HISTORY_ACTION_CONFIG,
} from "./history-types";

interface HistoryAIStatsTabProps {
  aiStats?: AIUsageStats | null;
  workspaceName?: string;
}

export function HistoryAIStatsTab({ aiStats, workspaceName }: HistoryAIStatsTabProps) {
  const aiLogs = aiStats?.logs ?? [];
  const totalCostTHB = (aiStats?.totalCost ?? 0) * 34.5;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center neu-tint-primary">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            AI Token & Cost Analytics
          </h2>
          <p className="text-muted-foreground text-xs">
            สรุปการใช้งาน Token และค่าใช้จ่ายของ AI{workspaceName ? ` · ${workspaceName}` : " ใน Workspace"}
          </p>
        </div>
      </div>

      {aiStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 neu-raised neu-mesh-card neu-grain p-6 rounded-3xl">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              ค่าใช้จ่ายสะสม (Est. Cost)
            </span>
            <h3 className="font-display text-2xl font-extrabold text-foreground tracking-tight flex items-baseline gap-1">
              ${aiStats.totalCost.toFixed(5)}
              <span className="text-xs font-bold text-muted-foreground">USD</span>
            </h3>
            <span className="text-xs text-primary font-bold block">
              ≈ {totalCostTHB.toFixed(2)} บาท (THB)
            </span>
          </div>

          <div className="space-y-1 border-l border-border/60 pl-5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Token ทั้งหมด
            </span>
            <h3 className="font-display text-2xl font-extrabold text-foreground tracking-tight flex items-baseline gap-1">
              {aiStats.totalTokens.toLocaleString()}
              <span className="text-xs font-bold text-muted-foreground">Tokens</span>
            </h3>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-bold block">
              เรียกใช้ AI {aiStats.totalCalls} ครั้ง
            </span>
          </div>

          <div className="space-y-1 border-l border-border/60 pl-5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              โมดูลเขียนข้อความ (Article)
            </span>
            <h3 className="font-display text-2xl font-extrabold text-foreground tracking-tight">
              {aiStats.articleCalls} <span className="text-xs font-bold text-muted-foreground">ครั้ง</span>
            </h3>
            <span className="text-xs text-muted-foreground font-medium block">Gemini &amp; LLM</span>
          </div>

          <div className="space-y-1 border-l border-border/60 pl-5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              โมดูลสร้างสื่อภาพ/วิดีโอ (Media)
            </span>
            <h3 className="font-display text-2xl font-extrabold text-foreground tracking-tight">
              {aiStats.imageCalls + aiStats.videoCalls}{" "}
              <span className="text-xs font-bold text-muted-foreground">ครั้ง</span>
            </h3>
            <span className="text-xs text-muted-foreground font-medium block">Imagen, Veo &amp; Stock</span>
          </div>
        </div>
      )}

      <div className="neu-raised neu-grain rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between gap-2">
          <h3 className="font-display font-bold text-foreground text-sm">ประวัติการเรียกใช้งาน AI รายครั้ง</h3>
          <span className="text-xs text-muted-foreground neu-pressed px-3 py-1 rounded-full">
            แสดง {aiLogs.length} รายการ
          </span>
        </div>

        {aiLogs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">
            ยังไม่มีประวัติการเรียกใช้งาน AI
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-[var(--surface-recessed)]/70">
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase">เวลา</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase">ประเภท</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Provider / Model</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-muted-foreground uppercase">Tokens</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-muted-foreground uppercase">ค่าใช้จ่าย (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {aiLogs.map((log) => {
                  const cfg = HISTORY_ACTION_CONFIG[log.actionType] ?? {
                    label: log.actionType,
                    badgeClass: "bg-[var(--surface-recessed)] text-muted-foreground border-border/60",
                    emoji: "⚙️",
                  };
                  return (
                    <tr key={log.id} className="hover:bg-[var(--surface-elevated)]/60 transition-colors">
                      <td className="px-6 py-3 text-xs text-muted-foreground font-mono">
                        {formatHistoryDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.badgeClass}`}
                        >
                          <span>{cfg.emoji}</span>
                          <span>{cfg.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-foreground font-semibold">
                        <span>{log.provider}</span>
                        {log.modelName && (
                          <span className="text-muted-foreground font-normal block text-[10px]">
                            {log.modelName}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs font-mono text-muted-foreground">
                        {log.totalTokens > 0 ? log.totalTokens.toLocaleString() : "—"}
                      </td>
                      <td className="px-6 py-3 text-right text-xs font-mono font-bold text-foreground">
                        ${log.estimatedCost.toFixed(5)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
