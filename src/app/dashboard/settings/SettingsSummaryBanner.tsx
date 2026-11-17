import React from "react";

interface SettingsSummaryBannerProps {
  activeTextLabel: string;
  activeImageLabel: string;
  activeVideoLabel: string;
}

export function SettingsSummaryBanner({
  activeTextLabel,
  activeImageLabel,
  activeVideoLabel,
}: SettingsSummaryBannerProps) {
  return (
    <div className="neu-raised neu-mesh-card neu-grain rounded-3xl border border-[var(--border)] p-6">
      <h3 className="font-display text-foreground text-sm mb-3">
        ✨ Workspace Configuration Summary
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="neu-pressed p-3.5 border border-[var(--border)] rounded-2xl space-y-1.5">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
            ✍️ Text Generator
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg inline-block bg-primary/15 text-primary-ink border border-primary/30">
            {activeTextLabel}
          </span>
        </div>

        <div className="neu-pressed p-3.5 border border-[var(--border)] rounded-2xl space-y-1.5">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
            🎨 Image Engine
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg inline-block bg-teal-500/15 text-teal-500 dark:text-teal-300 border border-teal-500/30">
            🖼️ {activeImageLabel}
          </span>
        </div>

        <div className="neu-pressed p-3.5 border border-[var(--border)] rounded-2xl space-y-1.5">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
            🎬 Video Studio
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg inline-block bg-rose-500/15 text-rose-400 border border-rose-500/30">
            {activeVideoLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
