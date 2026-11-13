"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe2, Layers, Sparkles } from "lucide-react";
import { PLATFORM_CONFIG, type LandingCopy } from "./landing-types";

interface LandingHeroProps {
  copy: LandingCopy;
  isDemo: boolean;
  totalPosts: number;
  totalChannels: number;
  totalSuccess: number;
  uniquePlatforms: string[];
}

export function LandingHero({
  copy,
  isDemo,
  totalPosts,
  totalChannels,
  totalSuccess,
  uniquePlatforms,
}: LandingHeroProps) {
  const stats = [
    {
      label: copy.totalPosts,
      value: totalPosts,
      icon: Layers,
      iconClass: "neu-tint-primary",
      pill: "Published",
    },
    {
      label: copy.platforms,
      value: totalChannels,
      icon: Globe2,
      iconClass: "neu-tint-teal",
      pill: "Connected",
    },
    {
      label: copy.success,
      value: totalSuccess,
      icon: CheckCircle2,
      iconClass: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_6px_18px_-4px_rgba(16,185,129,0.45)]",
      pill: "Auto-Sync",
    },
  ];

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="neu-raised neu-mesh-card neu-grain rounded-3xl border border-[var(--border)] p-6 sm:p-10 flex flex-col items-start gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="neu-pressed inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold text-foreground border border-[var(--border)]">
            <Sparkles className="size-3.5 text-primary-ink" />
            <span>{copy.badge}</span>
          </span>
          {isDemo && (
            <span className="neu-pressed inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-teal-400 border border-teal-500/30">
              <span className="size-1.5 rounded-full bg-teal-400 animate-pulse" />
              {copy.demoTag}
            </span>
          )}
        </div>

        <div className="space-y-3 max-w-3xl">
          <h1 className="font-display text-3xl sm:text-5xl text-foreground leading-[1.12]">
            {copy.heroTitleLine1}{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-teal-400 bg-clip-text text-transparent">
              {copy.heroTitleAccent}
            </span>
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-2xl">
            {copy.desc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/login"
            className="neu-tint-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all hover:brightness-110 hover:-translate-y-0.5"
          >
            <span>{copy.ctaStudio}</span>
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="#gallery"
            className="neu-raised inline-flex items-center gap-2 rounded-xl border border-[var(--border-control)] px-5 py-2.5 text-xs sm:text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <span>{copy.ctaGallery}</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="neu-raised neu-grain rounded-3xl border border-[var(--border)] p-5 flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`grid size-11 shrink-0 place-items-center rounded-2xl ${stat.iconClass}`}>
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-2xl sm:text-3xl text-foreground tabular-nums leading-none">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1 truncate">
                    {stat.label}
                  </div>
                </div>
              </div>
              <span className="neu-pressed rounded-full px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground shrink-0">
                {stat.pill}
              </span>
            </div>
          );
        })}
      </div>

      {uniquePlatforms.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
            {copy.channels}
          </span>
          {uniquePlatforms.map((platform) => {
            const cfg = PLATFORM_CONFIG[platform];
            if (!cfg) return null;
            return (
              <span
                key={platform}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-sm"
                style={{ background: cfg.bg }}
              >
                {cfg.icon}
                <span>{cfg.label}</span>
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}
