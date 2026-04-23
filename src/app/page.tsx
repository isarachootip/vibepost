import { getPublishedPostsForLanding } from "@/lib/actions/posts";
import Link from "next/link";
import React from "react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VibePost — ผลงานการโพสต์อัตโนมัติ",
  description:
    "ชมผลงานการโพสต์อัตโนมัติไปยังทุก Social Media Channel ด้วยระบบ VibePost Auto-Post System",
};

/* ── Platform config ───────────────────────────────────────── */
const PLATFORM_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  FACEBOOK: {
    label: "Facebook",
    color: "#fff",
    bg: "#1877F2",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  INSTAGRAM: {
    label: "Instagram",
    color: "#fff",
    bg: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  TWITTER: {
    label: "X / Twitter",
    color: "#fff",
    bg: "#000",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  LINKEDIN: {
    label: "LinkedIn",
    color: "#fff",
    bg: "#0A66C2",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
};

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/* ── Empty State ───────────────────────────────────────────── */
function EmptyGallery() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(88,86,214,0.15)",
          border: "1px solid rgba(88,86,214,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: 32,
        }}
      >
        🖼️
      </div>
      <h3 style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", marginBottom: 8 }}>
        ยังไม่มีผลงานการโพสต์
      </h3>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>
        โพสต์แรกของคุณจะปรากฏที่นี่เมื่อ Auto-Post ส่งออกสำเร็จ
      </p>
      {/* Animated placeholder cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 20,
          marginTop: 48,
          opacity: 0.25,
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: "rgba(88,86,214,0.08)",
              border: "1px solid rgba(88,86,214,0.15)",
              borderRadius: 16,
              overflow: "hidden",
              animation: `pulse ${1.2 + i * 0.2}s ease-in-out infinite`,
            }}
          >
            <div style={{ height: 180, background: "rgba(88,86,214,0.1)" }} />
            <div style={{ padding: 16 }}>
              <div style={{ height: 12, background: "rgba(255,255,255,0.1)", borderRadius: 6, marginBottom: 8 }} />
              <div style={{ height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 6, width: "70%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default async function LandingPage() {
  const { posts, totalPosts, totalChannels } = await getPublishedPostsForLanding();

  const uniquePlatforms = [
    ...new Set(posts.flatMap((p) => p.channels.map((c) => c.platform))),
  ];

  return (
    <>
      <style>{`
        :root {
          --primary: #f59e0b;
          --primary-dark: #d97706;
          --primary-light: #fcd34d;
          --primary-glow: rgba(245,158,11,0.18);
          --accent: #fbbf24;
          --sidebar-bg: #060a14;
          --sidebar-hover: #0f172a;
          --bg: #020617;
          --card-bg: rgba(255,255,255,0.03);
          --border: rgba(245,158,11,0.15);
          --text-primary: #f8fafc;
          --text-secondary: rgba(255,255,255,0.65);
          --text-muted: rgba(255,255,255,0.4);
          --radius: 14px;
          --radius-sm: 8px;
          --shadow: 0 4px 24px rgba(0,0,0,0.6);
          --transition: all 0.22s ease;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-body {
          font-family: 'Noto Sans Thai','Inter',sans-serif;
          background: var(--bg);
          color: var(--text-primary);
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient glow background */
        .lp-body::before {
          content: '';
          position: fixed;
          top: -20%;
          left: -10%;
          width: 60%;
          height: 60%;
          background: radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }
        .lp-body::after {
          content: '';
          position: fixed;
          bottom: -10%;
          right: -10%;
          width: 55%;
          height: 55%;
          background: radial-gradient(ellipse, rgba(252,211,77,0.1) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        .lp-content { position: relative; z-index: 1; }

        /* ── NAV ── */
        .lp-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 40px;
          background: rgba(26,26,46,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 100;
        }
        .lp-logo {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .lp-logo-icon {
          width: 38px; height: 38px; background: var(--primary);
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-size: 18px; box-shadow: 0 4px 16px rgba(88,86,214,0.5);
        }
        .lp-logo-text {
          font-size: 1.15rem; font-weight: 700; color: #fff; letter-spacing: -0.01em;
        }
        .lp-logo-text span { color: var(--primary-light); }
        .lp-login-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 20px; border-radius: 50px;
          background: var(--primary); color: #000;
          font-size: 0.85rem; font-weight: 600;
          text-decoration: none; transition: var(--transition);
          box-shadow: 0 4px 14px rgba(245,158,11,0.3);
          border: none; cursor: pointer;
        }
        .lp-login-btn:hover {
          background: var(--primary-light); box-shadow: 0 6px 20px rgba(245,158,11,0.5);
          transform: translateY(-1px);
        }

        /* ── HERO ── */
        .lp-hero {
          text-align: center;
          padding: 80px 40px 60px;
          max-width: 720px;
          margin: 0 auto;
        }
        .lp-hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px; border-radius: 50px;
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25);
          color: var(--primary-light); font-size: 0.78rem; font-weight: 600;
          margin-bottom: 24px; letter-spacing: 0.04em;
          animation: fadeInDown 0.6s ease;
        }
        .lp-hero h1 {
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 800; line-height: 1.15;
          color: #fff; margin-bottom: 16px;
          letter-spacing: -0.02em;
          animation: fadeInDown 0.7s ease 0.1s both;
        }
        .lp-hero h1 .gradient-text {
          background: linear-gradient(135deg, var(--primary-light), var(--accent));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-hero p {
          color: var(--text-secondary); font-size: 1rem; line-height: 1.65;
          max-width: 520px; margin: 0 auto 36px;
          animation: fadeInDown 0.7s ease 0.2s both;
        }

        /* ── STATS BAR ── */
        .lp-stats {
          display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;
          padding: 0 40px 60px;
          animation: fadeInDown 0.7s ease 0.3s both;
        }
        .lp-stat-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 24px;
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: var(--radius); backdrop-filter: blur(12px);
          transition: var(--transition);
        }
        .lp-stat-chip:hover { border-color: rgba(245,158,11,0.4); transform: translateY(-2px); }
        .lp-stat-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; flex-shrink: 0;
        }
        .lp-stat-icon.purple { background: rgba(245,158,11,0.15); }
        .lp-stat-icon.blue { background: rgba(252,211,77,0.15); }
        .lp-stat-icon.green { background: rgba(48,209,88,0.15); }
        .lp-stat-value { font-size: 1.5rem; font-weight: 800; color: #fff; line-height: 1; }
        .lp-stat-label { font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px; }

        /* ── PLATFORMS ROW ── */
        .lp-platforms {
          display: flex; justify-content: center; align-items: center;
          gap: 8px; flex-wrap: wrap;
          padding: 0 40px 48px;
        }
        .lp-platforms-label {
          font-size: 0.75rem; color: var(--text-muted); margin-right: 4px;
          font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
        }

        /* ── SECTION TITLE ── */
        .lp-section {
          max-width: 1400px; margin: 0 auto; padding: 0 32px 80px;
        }
        .lp-section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px; padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .lp-section-title {
          font-size: 1.25rem; font-weight: 700; color: #fff;
          display: flex; align-items: center; gap: 10px;
        }
        .lp-section-title::before {
          content: ''; display: block; width: 4px; height: 20px;
          background: linear-gradient(180deg, var(--primary), var(--accent));
          border-radius: 2px;
        }
        .lp-count-badge {
          font-size: 0.72rem; font-weight: 700; padding: 3px 10px;
          background: rgba(88,86,214,0.2); border: 1px solid rgba(88,86,214,0.3);
          border-radius: 50px; color: var(--primary-light);
        }

        /* ── GALLERY GRID ── */
        .lp-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        /* ── POST CARD ── */
        .lp-card {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: var(--radius); overflow: hidden;
          transition: var(--transition);
          backdrop-filter: blur(10px);
          display: flex; flex-direction: column;
          animation: cardIn 0.5s ease both;
        }
        .lp-card:hover {
          border-color: rgba(88,86,214,0.45);
          box-shadow: 0 8px 40px rgba(88,86,214,0.2), 0 0 0 1px rgba(88,86,214,0.15);
          transform: translateY(-4px);
        }
        .lp-card-img-wrap {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, rgba(88,86,214,0.15), rgba(52,170,220,0.1));
          aspect-ratio: 16/9;
          flex-shrink: 0;
        }
        .lp-card-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s ease;
        }
        .lp-card:hover .lp-card-img-wrap img { transform: scale(1.04); }
        .lp-card-img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 8px;
        }
        .lp-card-img-placeholder svg { opacity: 0.3; }
        .lp-card-img-placeholder span {
          font-size: 0.72rem; color: var(--text-muted); font-weight: 500;
        }
        .lp-card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
        .lp-card-content {
          font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
          overflow: hidden; flex: 1;
        }
        .lp-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 8px;
          padding-top: 12px; border-top: 1px solid var(--border);
        }
        .lp-channels { display: flex; gap: 5px; flex-wrap: wrap; }
        .lp-platform-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 50px;
          font-size: 0.68rem; font-weight: 700; color: #fff;
          white-space: nowrap;
        }
        .lp-card-date {
          font-size: 0.7rem; color: var(--text-muted); white-space: nowrap;
        }

        /* ── FOOTER ── */
        .lp-footer {
          text-align: center; padding: 32px 20px;
          border-top: 1px solid var(--border);
          color: var(--text-muted); font-size: 0.8rem;
          background: rgba(26,26,46,0.6);
        }
        .lp-footer a { color: var(--primary-light); text-decoration: none; }
        .lp-footer a:hover { color: var(--accent); }

        /* ── ANIMATIONS ── */
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .lp-nav { padding: 14px 20px; }
          .lp-hero { padding: 48px 20px 40px; }
          .lp-stats { padding: 0 20px 40px; }
          .lp-platforms { padding: 0 20px 36px; }
          .lp-section { padding: 0 16px 60px; }
          .lp-gallery { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="lp-body">
        <div className="lp-content">
          {/* NAV */}
          <nav className="lp-nav">
            <a href="/" className="lp-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 100 100" className="drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                <defs>
                  <linearGradient id="goldGradientLp" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="40%" stopColor="#d97706" />
                    <stop offset="60%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#92400e" />
                  </linearGradient>
                </defs>
                <path d="M10,25 L50,85 L90,25 L75,25 L50,60 L25,25 Z" fill="url(#goldGradientLp)" />
                <path d="M5,20 L45,80 L55,80 L95,20 L80,20 L50,65 L20,20 Z" fill="url(#goldGradientLp)" opacity="0.6" />
              </svg>
              <div className="lp-logo-text flex flex-col ml-1" style={{fontFamily: "serif", fontSize: "1.2rem", letterSpacing: "0.15em", color: "#fcd34d"}}>
                VIBE POST
                <span style={{fontSize: "0.55rem", letterSpacing: "0.2em", color: "rgba(252,211,77,0.7)", marginTop: "-4px"}}>Social Media</span>
              </div>
            </a>
            <Link href="/dashboard" className="lp-login-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" x2="3" y1="12" y2="12" />
              </svg>
              เข้าสู่ระบบ
            </Link>
          </nav>

          {/* HERO */}
          <section className="lp-hero">
            <div className="lp-hero-badge">
              <span>●</span> Auto-Post Gallery
            </div>
            <h1>
              ผลงานการโพสต์<br />
              <span className="gradient-text">อัตโนมัติทุก Channel</span>
            </h1>
            <p>
              รวมภาพและเนื้อหาที่ระบบ VibePost ได้ส่งออกไปยัง Social Media
              ทุกช่องทางสำเร็จแล้ว อัปเดตแบบ Real-time
            </p>
          </section>

          {/* STATS BAR */}
          <div className="lp-stats">
            <div className="lp-stat-chip">
              <div className="lp-stat-icon purple">📸</div>
              <div>
                <div className="lp-stat-value">{totalPosts}</div>
                <div className="lp-stat-label">โพสต์ทั้งหมด</div>
              </div>
            </div>
            <div className="lp-stat-chip">
              <div className="lp-stat-icon blue">🌐</div>
              <div>
                <div className="lp-stat-value">{totalChannels}</div>
                <div className="lp-stat-label">แพลตฟอร์ม</div>
              </div>
            </div>
            <div className="lp-stat-chip">
              <div className="lp-stat-icon green">✅</div>
              <div>
                <div className="lp-stat-value">
                  {posts.reduce((sum, p) => sum + p.channels.length, 0)}
                </div>
                <div className="lp-stat-label">การส่งออกสำเร็จ</div>
              </div>
            </div>
          </div>

          {/* PLATFORMS ROW */}
          {uniquePlatforms.length > 0 && (
            <div className="lp-platforms">
              <span className="lp-platforms-label">ช่องทาง:</span>
              {uniquePlatforms.map((platform) => {
                const cfg = PLATFORM_CONFIG[platform];
                if (!cfg) return null;
                return (
                  <span
                    key={platform}
                    className="lp-platform-badge"
                    style={{
                      background: cfg.bg,
                      padding: "5px 12px",
                      borderRadius: 50,
                      fontSize: "0.75rem",
                    }}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* GALLERY */}
          <section className="lp-section">
            <div className="lp-section-header">
              <h2 className="lp-section-title">
                Gallery โพสต์ล่าสุด
              </h2>
              {totalPosts > 0 && (
                <span className="lp-count-badge">{totalPosts} รายการ</span>
              )}
            </div>

            {posts.length === 0 ? (
              <EmptyGallery />
            ) : (
              <div className="lp-gallery">
                {posts.map((post, idx) => {
                  const mainImage = post.images[0];
                  return (
                    <article
                      key={post.id}
                      className="lp-card"
                      style={{ animationDelay: `${Math.min(idx * 0.05, 0.5)}s` }}
                    >
                      {/* Image */}
                      <div className="lp-card-img-wrap">
                        {mainImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mainImage.url}
                            alt={mainImage.fileName}
                            loading="lazy"
                          />
                        ) : (
                          <div className="lp-card-img-placeholder">
                            <svg
                              width="40"
                              height="40"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="rgba(88,86,214,0.6)"
                              strokeWidth="1.5"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span>Text Post</span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="lp-card-body">
                        <p className="lp-card-content">{post.content}</p>

                        <div className="lp-card-footer">
                          {/* Channel badges */}
                          <div className="lp-channels">
                            {post.channels.map((ch, i) => {
                              const cfg = PLATFORM_CONFIG[ch.platform];
                              if (!cfg) return null;
                              return (
                                <span
                                  key={i}
                                  className="lp-platform-badge"
                                  style={{ background: cfg.bg }}
                                  title={ch.accountName}
                                >
                                  {cfg.icon}
                                  {cfg.label}
                                </span>
                              );
                            })}
                          </div>
                          {/* Date */}
                          <span className="lp-card-date">
                            {formatDate(post.publishedTime)}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* FOOTER */}
          <footer className="lp-footer">
            <p>
              ⚡ Powered by{" "}
              <a href="/dashboard">VibePost Auto-Post System</a> · อัปเดตอัตโนมัติ
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
