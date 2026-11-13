"use client";

import React from "react";
import { ExternalLink, Image as ImageIcon, Play } from "lucide-react";
import {
  formatLandingDate,
  getExternalPostUrl,
  PLATFORM_CONFIG,
  type LandingLang,
  type LandingPost,
} from "./landing-types";

interface LandingGalleryCardProps {
  post: LandingPost;
  lang: LandingLang;
}

export function LandingGalleryCard({ post, lang }: LandingGalleryCardProps) {
  const mainImage = post.images?.[0];
  const isVideo =
    mainImage?.type === "video" || Boolean(mainImage?.fileName?.endsWith(".mp4"));

  return (
    <article className="neu-raised neu-grain group rounded-3xl border border-[var(--border)] p-3.5 flex flex-col gap-3.5 transition-all duration-200 hover:-translate-y-1">
      <div className="neu-pressed relative aspect-video overflow-hidden rounded-2xl bg-black/30">
        {mainImage ? (
          isVideo ? (
            <>
              <video
                src={mainImage.url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="neu-tint-primary absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full">
                <Play className="size-3.5 fill-current" />
              </span>
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainImage.url}
              alt={mainImage.fileName || "Published post preview"}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-8 opacity-45 text-primary-ink" />
            <span className="text-[11px] font-bold tracking-wide uppercase opacity-75">
              Text Post
            </span>
          </div>
        )}
      </div>

      <div className="px-1.5 pb-1 flex-1 flex flex-col justify-between gap-3.5">
        <p className="text-xs sm:text-[13px] leading-relaxed text-foreground/90 line-clamp-3">
          {post.content}
        </p>

        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.channels.map((ch, idx) => {
              const cfg = PLATFORM_CONFIG[ch.platform];
              if (!cfg) return null;
              const postUrl = getExternalPostUrl(ch.platform, ch.externalPostId);
              const badge = (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-xs transition-transform hover:scale-105"
                  style={{ background: cfg.bg }}
                  title={ch.accountName}
                >
                  {cfg.icon}
                  <span className="max-w-[110px] truncate">{ch.accountName}</span>
                  {postUrl && <ExternalLink className="size-2.5 opacity-85" />}
                </span>
              );

              return postUrl ? (
                <a
                  key={`${ch.platform}-${idx}`}
                  href={postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {badge}
                </a>
              ) : (
                <span key={`${ch.platform}-${idx}`}>{badge}</span>
              );
            })}
          </div>

          <span className="font-mono text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
            {formatLandingDate(post.publishedTime, lang)}
          </span>
        </div>
      </div>
    </article>
  );
}
