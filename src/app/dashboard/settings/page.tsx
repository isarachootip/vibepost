import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { AIProvider } from "@prisma/client";
import { APIKeyRow } from "./APIKeyRow";
import { DailyVideoQuotaCard } from "./DailyVideoQuotaCard";
import { getBangkokDayRange } from "@/lib/services/veo-quota.service";

interface ProviderMeta {
  id: AIProvider;
  name: string;
  description: string;
  icon: string;
  category: "text" | "media";
}

const AI_PROVIDERS: ProviderMeta[] = [
  { id: "GEMINI", name: "Google Gemini & Flow (Veo 3.1)", description: "Gemini 3.x, Imagen 4.0 และวิดีโอ Google Flow (Veo 3.1 Fast / Standard)", icon: "🤖", category: "text" },
  { id: "OPENAI", name: "OpenAI / ChatGPT", description: "GPT-4o, GPT-4 Turbo — ผลลัพธ์สูง", icon: "⚡", category: "text" },
  { id: "CLAUDE", name: "Anthropic Claude", description: "Claude 3.5 Sonnet — เขียนได้ดีมาก", icon: "🧠", category: "text" },
  { id: "OPENROUTER", name: "OpenRouter AI", description: "รวมหลาย model ผ่าน API เดียว", icon: "🔀", category: "text" },
  { id: "KIMI", name: "Moonshot / Kimi AI", description: "Kimi Moonshot-v1 — เขียนภาษาไทยและจีนยอดเยี่ยม", icon: "🌙", category: "text" },
  { id: "KLING", name: "Kling AI Video", description: "Kling API Key ในรูปแบบ AccessKey:SecretKey (เช่น AK_xxx:SK_xxx)", icon: "🎬", category: "media" },
  { id: "LUMA", name: "Luma Dream Machine", description: "Luma AI Dream Machine Video Bearer Token", icon: "🎥", category: "media" },
];

async function getSettingsRoleInfo(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.email) return null;
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, name: true },
  });
  if (!dbUser) return null;
  if (dbUser.role === "ADMIN") {
    return { role: "ADMIN" as const, isSuper: true, name: dbUser.name };
  }
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    select: { role: true },
  });
  return { role: member?.role ?? "MEMBER", isSuper: false, name: dbUser.name };
}

export default async function SettingsPage() {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) {
    return <div className="p-8 text-foreground">Please create a workspace first.</div>;
  }

  const { start, end } = getBangkokDayRange();
  const [userInfo, usedVideosToday] = await Promise.all([
    getSettingsRoleInfo(workspace.id),
    prisma.videoGenerationJob.count({
      where: {
        workspaceId: workspace.id,
        status: { in: ["PROCESSING", "COMPLETED"] },
        createdAt: { gte: start, lt: end },
      },
    }),
  ]);

  const isAdmin = userInfo?.role === "ADMIN";
  const roleColors: Record<string, string> = {
    ADMIN: "bg-rose-500/15 text-rose-500 dark:text-rose-300 border-rose-500/30",
    MEMBER: "bg-primary/15 text-primary-ink border-primary/30",
    VIEWER: "bg-muted text-muted-foreground border-[var(--border)]",
  };
  const roleLabels: Record<string, string> = {
    ADMIN: userInfo?.isSuper ? "⭐ Super Admin" : "🔑 Workspace Admin",
    MEMBER: "👤 Member",
    VIEWER: "👁️ Viewer",
  };

  const configs = workspace.promptConfigs || [];
  const activeTextProvider = AI_PROVIDERS.find(
    (p) => p.category === "text" && configs.some((c) => c.provider === p.id && c.isActive)
  );
  const activeMediaProvider = AI_PROVIDERS.find(
    (p) => p.category === "media" && configs.some((c) => c.provider === p.id && c.isActive)
  );
  const hasGeminiKey = configs.some((c) => c.provider === "GEMINI" && c.isActive);
  const hasOpenAIKey = configs.some((c) => c.provider === "OPENAI" && c.isActive);
  const activeImageEngine = hasGeminiKey
    ? "Google Imagen 4.0 / Gemini Image"
    : hasOpenAIKey
    ? "OpenAI DALL-E 3"
    : "Free Stable Diffusion";
  const activeVideoLabel = hasGeminiKey
    ? "🎬 Google Flow (Veo 3.1)"
    : activeMediaProvider
    ? `${activeMediaProvider.icon} ${activeMediaProvider.name}`
    : "📼 Curated Stock (Pexels)";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-12">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-foreground mb-1">⚙️ Settings — {workspace.name}</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            ตั้งค่า API Key Vault, Google Flow (Veo 3.1) และโควตา AI สำหรับ Workspace นี้
          </p>
        </div>
        {userInfo && (
          <span className={`neu-pressed px-3 py-1.5 rounded-full text-xs font-bold border ${roleColors[userInfo.role] || roleColors.MEMBER}`}>
            {roleLabels[userInfo.role] || "👤 Member"}
          </span>
        )}
      </header>

      {!isAdmin && (
        <div className="neu-raised flex items-start gap-3 p-4 border border-amber-500/30 rounded-2xl text-sm text-amber-500 dark:text-amber-300">
          <span className="text-xl">🔒</span>
          <div>
            <p className="font-bold">สิทธิ์อ่านอย่างเดียว</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              เฉพาะ Workspace Admin เท่านั้นที่แก้ไข API Key และโควตารายวันได้
            </p>
          </div>
        </div>
      )}

      <div className="neu-raised neu-mesh-card neu-grain rounded-3xl border border-[var(--border)] p-6">
        <h3 className="font-display text-foreground text-sm mb-3">✨ Workspace Configuration Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="neu-pressed p-3.5 border border-[var(--border)] rounded-2xl space-y-1.5">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">✍️ Text Generator</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg inline-block bg-primary/15 text-primary-ink border border-primary/30">
              {activeTextProvider ? `${activeTextProvider.icon} ${activeTextProvider.name}` : "⚠️ ยังไม่ได้ตั้งค่า"}
            </span>
          </div>
          <div className="neu-pressed p-3.5 border border-[var(--border)] rounded-2xl space-y-1.5">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">🎨 Image Engine</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg inline-block bg-teal-500/15 text-teal-500 dark:text-teal-300 border border-teal-500/30">
              🖼️ {activeImageEngine}
            </span>
          </div>
          <div className="neu-pressed p-3.5 border border-[var(--border)] rounded-2xl space-y-1.5">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">🎬 Video Studio</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg inline-block bg-rose-500/15 text-rose-400 border border-rose-500/30">
              {activeVideoLabel}
            </span>
          </div>
        </div>
      </div>

      <section className="neu-raised rounded-3xl border border-[var(--border)] p-6 space-y-4">
        <h2 className="font-display text-base text-foreground">✍️ 1. เครื่องมือเขียนบทความ &amp; Google Gemini / Flow</h2>
        <div className="space-y-3">
          {AI_PROVIDERS.filter((p) => p.category === "text").map((provider) => {
            const config = configs.find((c) => c.provider === provider.id);
            return (
              <APIKeyRow
                key={provider.id}
                providerId={provider.id}
                name={`${provider.icon} ${provider.name}`}
                description={provider.description}
                isConfigured={Boolean(config && config.isActive)}
                isReadOnly={!isAdmin}
              />
            );
          })}
        </div>
      </section>

      <section className="neu-raised rounded-3xl border border-[var(--border)] p-6 space-y-4">
        <h2 className="font-display text-base text-foreground">🎬 2. เครื่องมือวิดีโอทางเลือก (Optional Video Providers)</h2>
        <div className="space-y-3">
          {AI_PROVIDERS.filter((p) => p.category === "media").map((provider) => {
            const config = configs.find((c) => c.provider === provider.id);
            return (
              <APIKeyRow
                key={provider.id}
                providerId={provider.id}
                name={`${provider.icon} ${provider.name}`}
                description={provider.description}
                isConfigured={Boolean(config && config.isActive)}
                isReadOnly={!isAdmin}
              />
            );
          })}
        </div>
      </section>

      <DailyVideoQuotaCard
        initialQuota={workspace.dailyVideoQuota ?? 5}
        usedToday={usedVideosToday}
        isReadOnly={!isAdmin}
      />
    </div>
  );
}
