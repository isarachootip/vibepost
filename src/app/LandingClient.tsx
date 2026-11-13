"use client";

import React, { useState } from "react";
import Link from "next/link";
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
}

export default function LandingClient({
  dbPosts,
  initialTotal,
  initialChannels,
}: LandingClientProps) {
  const [lang, setLang] = useState<LandingLang>("th");
  const copy = LANDING_COPY[lang];

  const isDemo = dbPosts.length === 0;
  const posts = isDemo ? getDemoPosts(lang) : dbPosts;
  const totalPosts = isDemo ? posts.length : initialTotal;
  const totalChannels = isDemo ? 4 : initialChannels;
  const totalSuccess = isDemo
    ? 9
    : posts.reduce((sum, post) => sum + post.channels.length, 0);

  const uniquePlatforms = [
    ...new Set(posts.flatMap((post) => post.channels.map((ch) => ch.platform))),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--sheet)] text-foreground">
      <LandingNav lang={lang} onChangeLang={setLang} loginLabel={copy.login} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-12">
        <LandingHero
          copy={copy}
          isDemo={isDemo}
          totalPosts={totalPosts}
          totalChannels={totalChannels}
          totalSuccess={totalSuccess}
          uniquePlatforms={uniquePlatforms}
        />

        <section id="gallery" className="space-y-5">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <h2 className="font-display text-base sm:text-xl text-foreground flex items-center gap-2.5">
              <span className="neu-tint-primary inline-block w-2 h-6 rounded-full" />
              <span>{copy.latest}</span>
            </h2>
            {totalPosts > 0 && (
              <span className="neu-pressed rounded-full px-3 py-1 text-[11px] font-bold text-muted-foreground tabular-nums border border-[var(--border)]">
                {totalPosts} {copy.items}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <LandingGalleryCard key={post.id} post={post} lang={lang} />
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
