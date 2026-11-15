"use client";

import React from "react";
import Link from "next/link";
import { LogIn, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { LandingLang } from "./landing-types";
import { LANDING_DOCK_ITEMS } from "./landing-studio-data";
import { StudioFeatureIcon } from "./LandingStudioBento";

interface LandingNavProps {
  lang: LandingLang;
  onChangeLang: (lang: LandingLang) => void;
  loginLabel: string;
}

const LANG_OPTIONS: Array<{ id: LandingLang; label: string }> = [
  { id: "th", label: "TH" },
  { id: "en", label: "EN" },
  { id: "cn", label: "中文" },
];

export function LandingNav({ lang, onChangeLang, loginLabel }: LandingNavProps) {
  const dockItems = LANDING_DOCK_ITEMS[lang];

  return (
    <header className="sticky top-0 z-40 w-full pt-3 sm:pt-4 px-3 sm:px-6 lg:px-8 pointer-events-none">
      <div className="pointer-events-auto max-w-7xl mx-auto neu-raised neu-grain rounded-[1.5rem] border border-[var(--border)] px-3 sm:px-5 py-2.5 backdrop-blur-xl flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 group outline-none shrink-0">
          <div className="neu-tint-primary size-10 rounded-2xl grid place-items-center transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="size-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm sm:text-base text-foreground tracking-tight">
              VibePost
            </span>
            <span className="text-[11px] font-bold text-primary-ink tracking-wide mt-0.5">
              AI Studio
            </span>
          </div>
        </Link>

        {/* Center Floating Studio Dock matching Neramit */}
        <nav
          aria-label="Studio Quick Dock"
          className="hidden lg:flex items-center gap-1 neu-pressed rounded-2xl px-1.5 py-1 border border-[var(--border)]"
        >
          {dockItems.map((item) => {
            const inner = (
              <span
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all min-w-[68px] ${
                  item.active
                    ? "neu-raised text-foreground border border-[var(--border)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-[var(--surface-elevated)]/40"
                }`}
              >
                <StudioFeatureIcon
                  icon={item.icon}
                  className={`size-3.5 ${item.active ? "text-primary-ink" : ""}`}
                />
                <span className="leading-tight whitespace-nowrap">{item.label}</span>
              </span>
            );

            return item.href.startsWith("#") ? (
              <a key={item.id} href={item.href}>
                {inner}
              </a>
            ) : (
              <Link key={item.id} href={item.href}>
                {inner}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <div
            role="group"
            aria-label="Language switcher"
            className="neu-pressed flex items-center gap-1 rounded-full p-1 border border-[var(--border)]"
          >
            {LANG_OPTIONS.map((item) => {
              const active = lang === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeLang(item.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    active
                      ? "neu-tint-primary text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <ThemeToggle />

          <Link
            href="/login"
            className="neu-tint-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-bold transition-all hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0"
          >
            <LogIn className="size-3.5" />
            <span>{loginLabel}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
