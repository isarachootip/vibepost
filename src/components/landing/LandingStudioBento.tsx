"use client";

import React from "react";
import Link from "next/link";
import { Activity, ArrowRight, Home, LayoutGrid, Send, Sparkles, Wand2 } from "lucide-react";
import type { LandingLang } from "./landing-types";
import { LANDING_STUDIO_CARDS, type StudioIconKey } from "./landing-studio-data";

export function StudioFeatureIcon({ icon, className = "size-5" }: { icon: StudioIconKey; className?: string }) {
  switch (icon) {
    case "home":
      return <Home className={className} />;
    case "sparkles":
      return <Sparkles className={className} />;
    case "wand":
      return <Wand2 className={className} />;
    case "send":
      return <Send className={className} />;
    case "activity":
      return <Activity className={className} />;
    case "layout":
      return <LayoutGrid className={className} />;
  }
}

export function LandingStudioBento({ lang }: { lang: LandingLang }) {
  const cards = LANDING_STUDIO_CARDS[lang];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={card.href}
          className="neu-raised neu-grain group rounded-3xl border border-[var(--border)] p-5 sm:p-6 flex flex-col justify-between gap-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/35"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div
                className={`grid size-11 shrink-0 place-items-center rounded-2xl transition-transform duration-200 group-hover:scale-105 ${
                  card.accent === "teal" ? "neu-tint-teal" : "neu-tint-primary"
                }`}
              >
                <StudioFeatureIcon icon={card.icon} className="size-5" />
              </div>
              <span className="neu-pressed rounded-full px-2.5 py-1 text-[10px] font-bold text-muted-foreground border border-[var(--border)] truncate max-w-[165px]">
                {card.spec}
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="font-display text-base sm:text-[17px] text-foreground tracking-tight leading-snug">
                {card.title}
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                {card.description}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-ink group-hover:gap-2 transition-all">
            <span>{card.cta}</span>
            <ArrowRight className="size-3.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}
