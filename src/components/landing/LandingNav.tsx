"use client";

import React from "react";
import Link from "next/link";
import { LogIn, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { LandingLang } from "./landing-types";

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
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--sheet)]/90 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 group outline-none">
          <div className="neu-tint-primary size-9 sm:size-10 rounded-xl grid place-items-center transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="size-4 sm:size-5" />
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm sm:text-base text-foreground tracking-tight">
                VibePost
              </span>
              <span className="neu-pressed hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-primary-ink">
                AI Studio
              </span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground tracking-wide mt-0.5">
              Omni-Channel Publisher
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
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
