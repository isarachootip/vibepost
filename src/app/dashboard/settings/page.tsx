import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { AIProvider } from "@prisma/client";
import { APIKeyRow } from "./APIKeyRow";

interface ProviderMeta {
  id: AIProvider;
  name: string;
  description: string;
  icon: string;
  category: "text" | "media";
}

const AI_PROVIDERS: ProviderMeta[] = [
  { id: "GEMINI", name: "Google Gemini", description: "Gemini 2.5 Flash / Pro และโมเดลสร้างวิดีโอ Google Veo", icon: "🤖", category: "text" },
  { id: "OPENAI", name: "OpenAI / ChatGPT", description: "GPT-4o, GPT-4 Turbo — ผลลัพธ์สูง", icon: "⚡", category: "text" },
  { id: "CLAUDE", name: "Anthropic Claude", description: "Claude 3.5 Sonnet — เขียนได้ดีมาก", icon: "🧠", category: "text" },
  { id: "OPENROUTER", name: "OpenRouter AI", description: "รวมหลาย model ผ่าน API เดียว", icon: "🔀", category: "text" },
  { id: "KIMI", name: "Moonshot / Kimi AI", description: "Kimi Moonshot-v1 — เขียนภาษาไทยและจีนยอดเยี่ยม", icon: "🌙", category: "text" },
  { id: "KLING", name: "Kling AI Video", description: "Kling API Key ในรูปแบบ AccessKey:SecretKey (เช่น AK_xxx:SK_xxx)", icon: "🎬", category: "media" },
  { id: "LUMA", name: "Luma Dream Machine", description: "Luma AI Dream Machine Video Bearer Token", icon: "🎥", category: "media" },
];

async function getUserWorkspaceRole(workspaceId: string) {
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

  const userInfo = await getUserWorkspaceRole(workspace.id);
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
  const activeVideoProvider = AI_PROVIDERS.find(
    (p) => p.category === "media" && configs.some((c) => c.provider === p.id && c.isActive)
  );
  const hasGeminiKey = configs.some((c) => c.provider === "GEMINI" && c.isActive);
  const hasOpenAIKey = configs.some((c) => c.provider === "OPENAI" && c.isActive);
  const activeImageEngine = hasGeminiKey
    ? "Google Imagen 4.0 Fast (Auto-upgrade)"
    : hasOpenAIKey
    ? "OpenAI DALL-E 3 (Auto-upgrade)"
    : "Free Stable Diffusion (Default)";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-12">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-foreground mb-1">
            ⚙️ Settings — {workspace.name}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            ตั้งค่า API Key Vault และสมองกล AI สำหรับ Workspace นี้
          </p>
        </div>
        {userInfo && (
          <span
            className={`neu-pressed px-3 py-1.5 rounded-full text-xs font-bold border ${
              roleColors[userInfo.role] || roleColors.MEMBER
            }`}
          >
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
              เฉพาะ Workspace Admin เท่านั้นที่สามารถแก้ไข API Key ได้ กรุณาติดต่อ Admin ของ Workspace นี้
            </p>
          </div>
        </div>
      )}

      <div className="neu-raised neu-mesh-card neu-grain rounded-3xl border border-[var(--border)] p-6 space-y-4">
        <div>
          <h3 className="font-display text-foreground text-sm flex items-center gap-2">
            <span>✨</span> Workspace Configuration Summary
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            สรุปสถานะการประมวลผลของสมองกล AI ในพื้นที่ทำงานนี้
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="neu-pressed p-3.5 border border-[var(--border)] rounded-2xl space-y-1.5">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
              ✍️ Text Generator
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block ${
                activeTextProvider
                  ? "bg-primary/15 text-primary-ink border border-primary/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {activeTextProvider
                ? `${activeTextProvider.icon} ${activeTextProvider.name}`
                : "⚠️ ยังไม่ได้ตั้งค่า"}
            </span>
          </div>

          <div className="neu-pressed p-3.5 border border-[var(--border)] rounded-2xl space-y-1.5">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
              🎨 Image Engine
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg inline-block bg-teal-500/15 text-teal-500 dark:text-teal-300 border border-teal-500/30">
              🖼️ {activeImageEngine}
            </span>
          </div>

          <div className="neu-pressed p-3.5 border border-[var(--border)] rounded-2xl space-y-1.5">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
              🎬 Video Studio
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block ${
                activeVideoProvider
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {activeVideoProvider
                ? `${activeVideoProvider.icon} ${activeVideoProvider.name}`
                : "📼 Curated Stock (Pexels)"}
            </span>
          </div>
        </div>
      </div>

      <section className="neu-raised rounded-3xl border border-[var(--border)] p-6 space-y-5">
        <div>
          <h2 className="font-display text-base text-foreground flex items-center gap-2">
            <span>✍️</span> 1. เครื่องมือเขียนบทความ (Text Content Generators)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            กำหนดค่าคีย์ API สำหรับการสร้างสรรค์ข้อความ แคปชัน และแคมเปญโฆษณา
          </p>
        </div>

        <div className="space-y-3.5">
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

      <section className="neu-raised rounded-3xl border border-[var(--border)] p-6 space-y-5">
        <div>
          <h2 className="font-display text-base text-foreground flex items-center gap-2">
            <span>🎬</span> 2. เครื่องมือสร้างวิดีโอสตูดิโอ (Visuals & Video Generators)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            กำหนดค่าคีย์ API สำหรับการเจเนอเรตวิดีโอแบบ AI Text-to-Video อัจฉริยะ
          </p>
        </div>

        <div className="space-y-3.5">
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

        <p className="text-xs text-muted-foreground border-t border-[var(--border)] pt-4">
          🔐 API Key ถูกเข้ารหัสและใช้เฉพาะกับ Workspace <strong className="text-foreground">{workspace.name}</strong> เท่านั้น
        </p>
      </section>

      {isAdmin && (
        <div className="neu-raised rounded-3xl border border-destructive/30 p-6">
          <h2 className="font-display text-base text-destructive mb-1">⚠️ Danger Zone</h2>
          <p className="text-xs text-muted-foreground mb-4">การกระทำที่ไม่สามารถย้อนกลับได้</p>

          <div className="neu-pressed flex items-center justify-between gap-4 p-4 rounded-2xl border border-destructive/25">
            <div>
              <h4 className="text-foreground text-sm font-bold">ลบ Workspace</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                ลบ Workspace นี้และข้อมูลทั้งหมดอย่างถาวร
              </p>
            </div>
            <button
              type="button"
              className="bg-destructive/15 hover:bg-destructive/25 text-destructive border border-destructive/30 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Delete Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
