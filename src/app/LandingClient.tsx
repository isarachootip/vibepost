"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingGalleryCard } from "@/components/landing/LandingGalleryCard";
import {
  getDemoPosts,
  LANDING_COPY,
  type LandingLang,
  type LandingPost,
} from "@/components/landing/landing-types";

interface LandingClientProps {
  dbPosts: LandingPost[];
  initialTotal: number;
  initialChannels: number;
  initialSuccessCount?: number;
  initialPlatforms?: string[];
  hiddenCount?: number;
  isSuperAdmin?: boolean;
}

export default function LandingClient({
  dbPosts,
  initialTotal,
  initialChannels,
  initialSuccessCount,
  initialPlatforms,
  hiddenCount = 0,
  isSuperAdmin = false,
}: LandingClientProps) {
  const [lang, setLang] = useState<LandingLang>("th");
  const [showHidden, setShowHidden] = useState(false);
  const copy = LANDING_COPY[lang];

  const visibleDbPosts = showHidden
    ? dbPosts
    : dbPosts.filter((p) => p.effectivelyVisible !== false);

  const isDemo = visibleDbPosts.length === 0;
  const posts = isDemo ? getDemoPosts(lang) : visibleDbPosts;

  // Platform-wide Hero metrics preserve real system totals even when cards are hidden
  const hasRealSystemStats = initialTotal > 0;
  const totalPosts = hasRealSystemStats ? initialTotal : posts.length;
  const totalChannels = hasRealSystemStats ? initialChannels : 4;
  const totalSuccess = hasRealSystemStats
    ? initialSuccessCount ??
      dbPosts.reduce((sum, post) => sum + post.channels.length, 0)
    : 9;

  const uniquePlatforms =
    hasRealSystemStats && initialPlatforms && initialPlatforms.length > 0
      ? initialPlatforms
      : [...new Set(posts.flatMap((post) => post.channels.map((ch) => ch.platform)))];

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[var(--sheet)] text-foreground">
      <LandingNav lang={lang} onChangeLang={setLang} loginLabel={copy.login} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8 sm:space-y-10">
        <LandingHero
          lang={lang}
          copy={copy}
          isDemo={isDemo && !hasRealSystemStats}
          totalPosts={totalPosts}
          totalChannels={totalChannels}
          totalSuccess={totalSuccess}
          uniquePlatforms={uniquePlatforms}
        />

        <section id="gallery" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <h2 className="font-display text-base sm:text-xl text-foreground flex items-center gap-2.5">
              <span className="neu-tint-primary inline-block w-2 h-6 rounded-full" />
              <span>{copy.latest}</span>
            </h2>

            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setShowHidden((prev) => !prev)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold border inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    showHidden
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40"
                      : "neu-pressed text-muted-foreground hover:text-foreground border-[var(--border)]"
                  }`}
                >
                  {showHidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  <span>
                    {showHidden
                      ? `กำลังแสดงรวมที่ซ่อน (${hiddenCount})`
                      : `ดูโพสต์ที่ซ่อนไว้ (${hiddenCount})`}
                  </span>
                </button>
              )}

              {posts.length > 0 && (
                <span className="neu-pressed rounded-full px-3 py-1 text-[11px] font-bold text-muted-foreground tabular-nums border border-[var(--border)]">
                  {posts.length} {copy.items}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <LandingGalleryCard
                key={post.id}
                post={post}
                lang={lang}
                isSuperAdmin={isSuperAdmin}
                isDemoCard={isDemo}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]/70 py-7 px-4 text-center text-xs text-muted-foreground">
        <p>
          {copy.footerPrefix}{" "}
          <Link href="/dashboard" className="font-bold text-primary-ink hover:underline">
            {copy.footerLink}
          </Link>{" "}
          · {copy.footerSuffix}
        </p>
      </footer>
    </div>
  );
}
